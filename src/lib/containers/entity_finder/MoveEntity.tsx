import React, { CSSProperties, useEffect, useState } from 'react'
import { Button } from 'react-bootstrap'
import { SynapseClient } from '../../utils'
import { EntityHeader } from '../../utils/synapseTypes'

type MoveEntityProps = {
  sessionToken: string
  entityId: string // the entity to move
}

enum BrowseWithin {
  MY_PROJECTS,
  CURRENT_PROJECT,
  MY_FAVORITES,
}

const columnStyle = { display: 'inline-block', textOverflow: 'ellipsis' }
const col1Style = {
  ...columnStyle,
  width: '60%',
}
const col2Style = { ...columnStyle, width: '20%' }
const col3Style = { ...columnStyle, width: '20%' }

type RowProps = {
  sessionToken: string
  entityHeader: EntityHeader
  selectedId: string
  setSelectedId: (entityId: string) => void
  level?: number
  autoExpand?: (entityHeader: EntityHeader) => boolean
}

const Row: React.FunctionComponent<RowProps> = ({
  sessionToken,
  entityHeader,
  selectedId,
  setSelectedId,
  level = 0,
  autoExpand = () => false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [allChildrenLoaded, setAllChildrenLoaded] = useState(false)
  const [childEntities, setChildEntities] = useState<EntityHeader[]>([])

  const loadChildren = async () => {
    console.log(
      `Loading children for ${entityHeader.name} (${entityHeader.id})`,
    )
    const result = await SynapseClient.getEntityChildren(
      {
        parentId: entityHeader.id,
        includeTypes: ['project', 'folder'],
      },
      sessionToken,
    )
    setChildEntities(result.page)
    // TODO: pagination
  }

  useEffect(() => {
    if (autoExpand(entityHeader)) {
      setIsExpanded(true)
    }
  }, [childEntities])

  useEffect(() => {
    console.log(`${entityHeader.name}: ${allChildrenLoaded}`)
    if (!allChildrenLoaded) {
      loadChildren(entityHeader)
      setAllChildrenLoaded(true)
    }
  }, [allChildrenLoaded, isExpanded])

  return (
    <>
      <div
        className={`MoveEntity_Row${
          selectedId === entityHeader.id ? ' MoveEntity_Row_Selected' : ''
        }`}
        key={entityHeader.id}
        onClick={() => setSelectedId(entityHeader.id)}
      >
        <span style={col1Style}>
          <span style={{ paddingLeft: `${level * 15}px` }}></span>
          {allChildrenLoaded && childEntities && childEntities.length > 0 ? (
            <span
              className={'MoveEntityExpandButton'}
              onClick={e => {
                e.stopPropagation()
                setIsExpanded(!isExpanded)
              }}
            >
              {isExpanded ? '▾' : '▸'}
            </span>
          ) : (
            <span style={{ padding: '10px' }}></span>
          )}
          <span>{entityHeader.name}</span>
        </span>
        <span style={col2Style}>-</span>
        <span style={col3Style}>{entityHeader.id}</span>
      </div>
      <div style={!isExpanded ? { display: 'none' } : {}}>
        {childEntities?.map(child => {
          return (
            <Row
              key={child.id}
              sessionToken={sessionToken}
              entityHeader={child}
              selectedId={selectedId}
              setSelectedId={setSelectedId}
              level={level + 1}
              autoExpand={autoExpand}
            ></Row>
          )
        })}
      </div>
    </>
  )
}

export const MoveEntity: React.FunctionComponent<MoveEntityProps> = ({
  sessionToken,
  entityId,
}) => {
  const [currentBrowsingDirectory, setCurrentBrowsingDirectory] = useState<
    EntityHeader[]
  >()
  const [entityPath, setEntityPath] = useState<EntityHeader[]>([]) // Array of synIds, first is the project, last is the parent.
  const [source, setSource] = useState<string>() // synId of parent, maybe should be prop not state
  const [destination, setDestination] = useState<string>('') // synId
  const [currentProject, setCurrentProject] = useState<EntityHeader>()
  const [myProjects, setMyProjects] = useState<Array<EntityHeader>>()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [browseWithin, setBrowseWithin] = useState<BrowseWithin>(
    BrowseWithin.CURRENT_PROJECT,
  )
  const [canMove, setCanMove] = useState<boolean>(false)

  const initialRender = async () => {
    // SynapseClient.getMyProjects(sessionToken).then(
    //   (projects: ProjectHeaderList) => {
    //     setMyProjects(
    //       projects.results.map(
    //         (project: ProjectHeader): Directory => {
    //           return {
    //             entityHeader: project,
    //             loadedAllChildren: false,
    //             children: [],
    //           }
    //         },
    //       ),
    //     )
    //   },
    // )
    const result = await SynapseClient.getEntityPath(sessionToken, entityId)
    const paths = result.path.slice(1, result.path.length)
    setEntityPath(paths)

    const projectDirectory = paths[0]

    const currentLocation = paths[paths.length - 2].id
    // let currentDirectory = projectDirectory
    // await loadChildren(currentDirectory)
    // for (const header of result.path.slice(1, result.path.length - 1)) {
    //   currentDirectory = currentDirectory.children?.find(
    //     x => x.entityHeader.id === header.id,
    //   )!
    //   await loadChildren(currentDirectory)
    // }
    // let prevDirectory = projectDirectory
    // for (const entity of result.path.slice(2, result.path.length - 1)) {
    //   let currentDirectory = {
    //     node: entity,
    //     loadedAllChildren: false,
    //   }
    //   prevDirectory.children = [currentDirectory]
    //   prevDirectory = currentDirectory
    // }
    setCurrentProject(projectDirectory)
    setSource(currentLocation)
    setDestination(currentLocation)
    setCurrentBrowsingDirectory([projectDirectory])
  }

  // Initial render
  useEffect(() => {
    setIsLoading(true)

    initialRender().then(() => {
      setIsLoading(false)
    })
  }, [sessionToken])

  // Selecting the current view
  useEffect(() => {
    if (currentProject) {
      console.log(currentProject)
      if (browseWithin === BrowseWithin.MY_PROJECTS) {
        setCurrentBrowsingDirectory(myProjects)
      } else if (browseWithin === BrowseWithin.CURRENT_PROJECT) {
        setCurrentBrowsingDirectory([currentProject])
      }
    }
  }, [sessionToken, currentProject, browseWithin])

  // Determine whether or not we can move the entity to the location
  useEffect(() => {
    setCanMove(source !== destination)
  }, [destination])

  const headerStyle: CSSProperties = {
    fontWeight: 'bold',
    padding: '16px 10px',
    boxShadow: '0 3px 10px rgba(93, 105, 171, 0.1)',
  }

  return (
    <div className="bootstrap-4-backport">
      <h4>Move Entity</h4>
      {isLoading ? (
        <div className="spinner" />
      ) : (
        <div
          style={{
            border: '1px solid #dedede',
            borderRadius: '5px',
            width: 'fill-container',
          }}
        >
          <div style={headerStyle}>
            <span style={col1Style}>Name</span>
            <span style={col2Style}>Status</span>
            <span style={col3Style}>ID</span>
          </div>
          <div style={{ height: '400px', overflow: 'scroll' }}>
            {currentBrowsingDirectory?.map(entity => {
              return (
                <Row
                  key={entity.id}
                  sessionToken={sessionToken}
                  entityHeader={entity}
                  selectedId={destination}
                  setSelectedId={(entityId: string) => {
                    setDestination(entityId)
                  }}
                  autoExpand={(entityHeader: EntityHeader) => {
                    const value = entityPath
                      .map(header => header.id)
                      .includes(entityHeader.id)
                    console.log(`autoexpand for ${entityHeader.name}: ${value}`)
                    return value
                  }}
                ></Row>
              )
            })}
          </div>
        </div>
      )}
      <h3>Selected: {destination}</h3>
      <Button disabled={!canMove}>Move</Button>
      <Button
        onClick={() => {
          console.log(currentBrowsingDirectory)
        }}
      >
        Print current directory
      </Button>
    </div>
  )
}

export default MoveEntity

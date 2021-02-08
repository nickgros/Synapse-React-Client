import React, { useEffect, useState } from 'react'
import { Button } from 'react-bootstrap'
import { ReflexContainer, ReflexElement, ReflexSplitter } from 'react-reflex'
import { SynapseClient } from '../../utils'
import { EntityHeader } from '../../utils/synapseTypes'
import { EntityType } from '../../utils/synapseTypes/EntityType'
import { DetailsView } from './EntityFinderDetailsView'
import { TreeView } from './EntityFinderTreeView'

type EntityFinderProps = {
  sessionToken: string
  entityId: string // the entity to move
  selectMultiple?: boolean
}

enum BrowseWithin {
  MY_PROJECTS,
  CURRENT_PROJECT,
  MY_FAVORITES,
}

export const EntityFinder: React.FunctionComponent<EntityFinderProps> = ({
  sessionToken,
  entityId,
  selectMultiple = false,
}) => {
  const [currentBrowsingDirectory, setCurrentBrowsingDirectory] = useState<
    EntityHeader[]
  >([])
  const [entityPath, setEntityPath] = useState<EntityHeader[]>([]) // Array of synIds, first is the project, last is the parent.
  const [source, setSource] = useState<string>() // synId of parent, maybe should be prop not state
  const [destination, setDestination] = useState<string>('') // synId
  const [selectedEntities, setSelectedEntities] = useState<string[]>([]) // synId(s)
  const [currentProject, setCurrentProject] = useState<EntityHeader>()
  const [myProjects, setMyProjects] = useState<Array<EntityHeader>>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [browseWithin, setBrowseWithin] = useState<BrowseWithin>(
    BrowseWithin.CURRENT_PROJECT,
  )

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

  return (
    <div className="bootstrap-4-backport">
      <h4>Move Entity</h4>
      {isLoading ? (
        <div className="spinner" />
      ) : (
        <div style={{ height: '400px' }}>
          <ReflexContainer orientation="vertical">
            <ReflexElement minSize={200} size={350}>
              <TreeView
                sessionToken={sessionToken}
                entities={currentBrowsingDirectory}
                setSelected={(id: string) => {
                  setDestination(id)
                }}
                selected={destination}
                // autoExpand={() => false}
                // autoExpand={(entityHeader: EntityHeader) => {
                //   const value = entityPath
                //     .map(header => header.id)
                //     .includes(entityHeader.id)
                //   console.log(`autoexpand for ${entityHeader.name}: ${value}`)
                //   return value
                // }}
              ></TreeView>
            </ReflexElement>
            <ReflexSplitter />

            <ReflexElement>
              <DetailsView
                sessionToken={sessionToken}
                parentContainer={destination}
                selected={selectedEntities}
                onSelect={selectedId => {
                  if (!selectedEntities.includes(selectedId)) {
                    setSelectedEntities([...selectedEntities, selectedId])
                  }
                  if (!selectMultiple) {
                    setSelectedEntities([selectedId])
                  }
                }}
                onDeselect={deselectedId => {
                  if (selectedEntities.includes(deselectedId)) {
                    setSelectedEntities(
                      selectedEntities.filter(id => id !== deselectedId),
                    )
                  }
                }}
                filter={[EntityType.FOLDER, EntityType.FILE]}
              ></DetailsView>
            </ReflexElement>
          </ReflexContainer>
        </div>
      )}
      <p>Current container: {destination}</p>
      <p>Selected entities: {selectedEntities.join(', ')}</p>
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

export default EntityFinder

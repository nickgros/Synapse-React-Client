import React, { useEffect, useState } from 'react'
import { Button } from 'react-bootstrap'
import { ReflexContainer, ReflexElement, ReflexSplitter } from 'react-reflex'
import { SynapseClient } from '../../utils'
import { EntityBundle, EntityHeader } from '../../utils/synapseTypes'
import { EntityType } from '../../utils/synapseTypes/EntityType'
import { DetailsView } from './EntityFinderDetailsView'
import { TreeView } from './EntityFinderTreeView'

// type CheckCriteriaEvent = 'finder' | 'select' // optimization idea (premature)
type EntityFinderProps = {
  sessionToken: string
  initialContainerId: string // the initial entity container that should be open
  confirmCopy: string // The text to display in the button
  onConfirm: (selectedEntityIds: string[]) => void // returns the list of selected entity IDs
  selectMultiple?: boolean
  allowSelectionFor?: (header: EntityHeader, bundle?: EntityBundle) => boolean // TODO: Define additional criteria that prevents an entity from being selected.
  // other names: `enableSelectionFilter`
}

enum BrowseWithin {
  MY_PROJECTS,
  CURRENT_PROJECT,
  MY_FAVORITES,
}

export const EntityFinder: React.FunctionComponent<EntityFinderProps> = ({
  sessionToken,
  initialContainerId,
  selectMultiple = false,
}) => {
  const [currentBrowsingDirectory, setCurrentBrowsingDirectory] = useState<
    EntityHeader[]
  >([])
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [containerId, setContainerId] = useState<string>(initialContainerId) // synId
  const [selectedEntities, setSelectedEntities] = useState<string[]>([]) // synId(s)

  const [currentProject, setCurrentProject] = useState<EntityHeader>()
  const [myProjects] = useState<Array<EntityHeader>>([])
  const [browseWithin] = useState<BrowseWithin>(BrowseWithin.CURRENT_PROJECT)

  const initialRender = async () => {
    const result = await SynapseClient.getEntityPath(sessionToken, containerId)
    const paths = result.path.slice(1, result.path.length)

    const projectDirectory = paths[0]

    setCurrentProject(projectDirectory)
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
                topLevelEntities={currentBrowsingDirectory}
                selected={containerId}
                setSelected={(id: string) => {
                  setContainerId(id)
                }}
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
                parentContainer={containerId}
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
      <p>Current container: {containerId}</p>
      {selectMultiple ? (
        <p>Selected entities: {selectedEntities.join(', ')}</p>
      ) : (
        <p>Selected:</p>
      )}
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

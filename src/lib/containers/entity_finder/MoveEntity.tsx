import { SynapseClient } from 'lib/utils'
import { ProjectHeader } from 'lib/utils/synapseTypes'
import React, { useEffect, useState } from 'react'

type MoveEntityProps = {
  sessionToken: string
  currentProject?: string
}

enum BrowseWithin {
  MY_PROJECTS,
  CURRENT_PROJECT,
  MY_FAVORITES,
}

export const MoveEntity: React.FunctionComponent<MoveEntityProps> = ({
  sessionToken,
  currentProject,
}) => {
  const [myProjects, setMyProjects] = useState<Array<ProjectHeader>>()
  const [browseWithin, setBrowseWithin] = useState<BrowseWithin>()

  useEffect(() => {
    SynapseClient.getMyProjects(sessionToken).then(myProjects => {
      setMyProjects(myProjects.results)
    })
  })

  return (
    <div className="bootstrap-4-backport">
      {myProjects?.map(project => {
        return <div key={project.id}>{project.name}</div>
      })}
    </div>
  )
}

export default MoveEntity

import React, { CSSProperties, useEffect, useState } from 'react'
import { SynapseClient } from '../../utils'
import { ProjectHeader } from '../../utils/synapseTypes'

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
  }, [sessionToken])

  const columnStyle = { display: 'inline-block', textOverflow: 'ellipsis' }
  const col1Style = {
    ...columnStyle,
    width: '60%',
  }
  const col2Style = { ...columnStyle, width: '20%' }
  const col3Style = { ...columnStyle, width: '20%' }

  const headerStyle: CSSProperties = {
    fontWeight: 'bold',
    padding: '16px 10px',
    boxShadow: '0 3px 10px rgba(93, 105, 171, 0.1)',
  }

  const rowStyle = {
    padding: '16px 10px',
    borderBottom: '1px solid #cdcdcd',
  }

  return (
    <div className="bootstrap-4-backport">
      <h4>Move Entity</h4>
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
          {myProjects?.map(project => {
            return (
              <div key={project.id} style={rowStyle}>
                <span style={col1Style}>{project.name}</span>
                <span style={col2Style}>-</span>
                <span style={col3Style}>{project.id}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default MoveEntity

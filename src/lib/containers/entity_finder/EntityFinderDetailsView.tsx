import React, { useEffect, useState } from 'react'
import useDeepCompareEffect from 'use-deep-compare-effect'
import { SynapseClient } from '../..'
import { EntityBundle, EntityHeader } from '../../utils/synapseTypes'
import { EntityType } from '../../utils/synapseTypes/EntityType'
import { EntityBadge } from '../EntityBadge'
import RenderIfInView from '../RenderIfInView'
import { getIconForEntityType } from './EntityFinderTreeView'
import moment from 'moment'

type DetailsViewRowProps = {
  sessionToken: string
  entityHeader: EntityHeader
  isSelected: boolean
  onClick: (entityId: string) => void
  autoExpand?: (entityHeader: EntityHeader) => boolean
}

const DetailsViewRow: React.FunctionComponent<DetailsViewRowProps> = ({
  sessionToken,
  entityHeader,
  isSelected,
  onClick,
  autoExpand = () => false,
}) => {
  const [bundle, setBundle] = useState<EntityBundle>()

  useEffect(() => {
    SynapseClient.getEntityBundleV2(
      entityHeader.id,
      {
        includeAnnotations: true,
        includeBenefactorACL: true,
        includePermissions: true,
        includeRootWikiId: true,
        includeThreadCount: true,
      },
      undefined,
      sessionToken,
    ).then(response => {
      setBundle(response)
    })
  }, [])

  return (
    <tr
      className={`EntityFinderDetailsView__Row${
        isSelected ? ' EntityFinderDetailsView__Row__Selected' : ''
      }`}
      onClick={() => onClick(entityHeader.id)}
    >
      <td className="NameColumn">
        <span>{getIconForEntityType(entityHeader.type)}</span>
        {entityHeader.name}
      </td>
      <td className="AccessColumn">
        {bundle && <EntityBadge entityId={entityHeader.id} bundle={bundle} />}
      </td>
      <td className="IdColumn">{entityHeader.id}</td>
      <td className="CreatedOnColumn">
        {moment(entityHeader.createdOn).format('YYYY-MM-DD hh:mm A')}
      </td>
      <td className="ModifiedOnColumn">
        {moment(entityHeader.modifiedOn).format('YYYY-MM-DD hh:mm A')}
      </td>
    </tr>
  )
}

// TODO: The date needs to respect profile settings. Can probably extract to a util function. The web client sets a cookie

export type DetailsViewProps = {
  sessionToken: string
  parentContainer: string // synId
  selected: string[] // synId(s)
  onSelect: (entityId: string) => void
  onDeselect: (entityId: string) => void
  filter: EntityType[] // default []
}

export const DetailsView: React.FunctionComponent<DetailsViewProps> = ({
  sessionToken,
  parentContainer,
  selected,
  onSelect,
  onDeselect,
  filter = [],
}) => {
  const [entities, setEntities] = useState<EntityHeader[]>([])

  useDeepCompareEffect(() => {
    SynapseClient.getEntityChildren(
      {
        parentId: parentContainer,
        includeTypes: filter,
      },
      sessionToken,
    ).then(response => {
      setEntities(response.page)
      // TODO: pagination
    })
  }, [sessionToken, parentContainer, filter])

  return (
    <div
      className="EntityFinderDetailsView"
      style={{ height: '400px', width: '100%', overflow: 'auto' }}
    >
      <table style={{ width: '100%' }}>
        <thead>
          <tr className="EntityFinderDetailsView__HeaderRow">
            <th className="NameColumn">Name</th>
            <th className="AccessColumn">Access</th>
            <th className="IdColumn">ID</th>
            <th className="CreatedOnColumn">Created on</th>
            <th className="ModifiedOnColumn">Modified on</th>
          </tr>
        </thead>
        <tbody className="EntityFinderDetailsView__TableBody">
          {entities?.map(entity => {
            return (
              <DetailsViewRow
                key={entity.id}
                sessionToken={sessionToken}
                entityHeader={entity}
                isSelected={selected.includes(entity.id)}
                onClick={entityId => {
                  if (selected.includes(entityId)) {
                    onDeselect(entityId)
                  } else {
                    onSelect(entityId)
                  }
                }}
                //   selectedId={selected}
                //   setSelectedId={(entityId: string) => {
                //     setSelected(entityId)
                //   }}
              ></DetailsViewRow>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
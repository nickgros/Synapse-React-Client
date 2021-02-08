import React from 'react'
import { EntityBundle } from '../utils/synapseTypes'
import {
  faAlignLeft,
  faCheck,
  faComment,
  faGlobe,
  faLock,
  faNewspaper,
  faTag,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import _ from 'lodash-es'

const AUTHENTICATED_PRINCIPAL_ID = 273948
const PUBLIC_PRINCIPAL_ID = 273949
const ANONYMOUS_PRINCIPAL_ID = 273950

const isPublic = (bundle: EntityBundle): boolean => {
  console.log(bundle.threadCount)
  return bundle.benefactorAcl!.resourceAccess.some(ra => {
    return (
      ra.principalId === AUTHENTICATED_PRINCIPAL_ID ||
      ra.principalId === PUBLIC_PRINCIPAL_ID ||
      ra.principalId === ANONYMOUS_PRINCIPAL_ID
    )
  })
}

type EntityBadgeProps = {
  entityId: string
  bundle: EntityBundle
}

/**
 * Stateless component used to show multiple entity badges.
 * Adapted from https://github.com/Sage-Bionetworks/SynapseWebClient/blob/46b9b717636cda2421926d96365244bbb72a05b6/src/main/java/org/sagebionetworks/web/client/widget/entity/EntityBadge.java
 *
 * List of badges and bundle components required to show them:
 * - Private/Public badge (benefactorAcl)
 * - Has Local Sharing Settings (benefactorAcl)
 * - Annotations badge (annotations)
 * - Has Wiki (rootWikiId)
 * - Has Discussion Thread (threadCount)
 */
export const EntityBadge: React.FunctionComponent<EntityBadgeProps> = ({
  entityId,
  bundle,
}) => {
  // TODO: Unlink (this should only be shown in contexts where the entity should be editable)
  // TODO: Download list?
  return (
    <div className="EntityBadge">
      {bundle.benefactorAcl && (
        <>
          <FontAwesomeIcon
            className="EntityBadge__Badge"
            icon={isPublic(bundle) ? faGlobe : faLock}
            aria-hidden="true"
          />
          {entityId === bundle.benefactorAcl.id}
          <FontAwesomeIcon
            className="EntityBadge__Badge"
            icon={faCheck}
            aria-hidden="true"
          />
        </>
      )}
      {bundle.annotations && !_.isEmpty(bundle.annotations.annotations) && (
        <FontAwesomeIcon
          className="EntityBadge__Badge"
          icon={faTag}
          aria-hidden="true"
        />
      )}
      {bundle.rootWikiId && (
        <FontAwesomeIcon
          //   style={{ maxWidth: '20px', maxHeight: '20px' }}
          className="EntityBadge__Badge"
          icon={faAlignLeft} // faNewspaper is ugly
          aria-hidden="true"
        />
      )}
      {!!bundle.threadCount && !!(bundle.threadCount > 0) && (
        <FontAwesomeIcon
          className="EntityBadge__Badge"
          icon={faComment}
          aria-hidden="true"
        />
      )}
    </div>
  )
}

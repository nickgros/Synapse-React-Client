import React, { useEffect, useState } from 'react'
import {
  QueryBundleRequest,
  FileHandleAssociation,
  FileHandleAssociateType,
  BatchFileRequest,
} from '../../../utils/synapseTypes'
import { SynapseConstants } from '../../../utils'
import { SynapseClientError, getFiles } from '../../../utils/SynapseClient'
import { ErrorBanner } from '../../ErrorBanner'
import useGetQueryResultBundle from '../../../utils/hooks/useGetQueryResultBundle'
import useShowDesktop from '../../../utils/hooks/useShowDesktop'
import GoalsMobile from './Goals.Mobile'
import GoalsDesktop from './Goals.Desktop'
import { getFieldIndex } from '../../../utils/functions/queryUtils'

export type GoalsProps = {
  entityId: string
  token?: string
}

export type GoalsDataProps = {
  countSql?: string
  title: string
  summary: string
  link: string
  asset: string
  token?: string
}

enum ExpectedColumns {
  TABLEID = 'TableId', // Both TableId or CountSql are used to indicate what Table rows to count.
  COUNT_SQL = 'CountSql', // Code uses CountSql over TableId if defined (if the CountSql column is in the schema and filled in).
  TITLE = 'Title',
  SUMMARY = 'Summary',
  LINK = 'Link',
  ASSET = 'Asset',
}

export default function Goals(props: GoalsProps) {
  const { entityId, token } = props
  const [assets, setAssets] = useState<string[] | undefined>()
  const [error, setError] = useState<string | SynapseClientError | undefined>()
  const showDesktop = useShowDesktop()
  const queryBundleRequest: QueryBundleRequest = {
    concreteType: 'org.sagebionetworks.repo.model.table.QueryBundleRequest',
    entityId,
    partMask:
      SynapseConstants.BUNDLE_MASK_QUERY_SELECT_COLUMNS |
      SynapseConstants.BUNDLE_MASK_QUERY_RESULTS,
    query: {
      sql: `select * from ${entityId} order by ItemOrder`,
    },
  }
  const { queryResultBundle } = useGetQueryResultBundle({
    token,
    queryBundleRequest,
  })

  useEffect(() => {
    const getData = async () => {
      try {
        const assetColumnIndex = getFieldIndex(
          ExpectedColumns.ASSET,
          queryResultBundle,
        )
        const assets =
          queryResultBundle?.queryResult.queryResults.rows.map(
            el => el.values[assetColumnIndex],
          ) ?? []
        if (assets.length === 0) {
          // wait for data to load
          return
        }
        const fileHandleAssociationList: FileHandleAssociation[] = assets.map(
          fileId => {
            return {
              associateObjectId: entityId!,
              associateObjectType: FileHandleAssociateType.TableEntity,
              fileHandleId: fileId,
            }
          },
        )
        const batchFileRequest: BatchFileRequest = {
          includeFileHandles: false,
          includePreSignedURLs: true,
          includePreviewPreSignedURLs: false,
          requestedFiles: fileHandleAssociationList,
        }
        const files = await getFiles(batchFileRequest, token)
        setError(undefined)
        setAssets(
          files.requestedFiles
            .filter(el => el.preSignedURL !== undefined)
            .map(el => el.preSignedURL!),
        )
      } catch (e) {
        console.error('Error on get data', e)
        setError(e)
      }
    }
    getData()
  }, [entityId, token, queryResultBundle])

  const tableIdColumnIndex = getFieldIndex(
    ExpectedColumns.TABLEID,
    queryResultBundle,
  )
  const countSqlColumnIndex = getFieldIndex(
    ExpectedColumns.COUNT_SQL,
    queryResultBundle,
  )

  const titleColumnIndex = getFieldIndex(
    ExpectedColumns.TITLE,
    queryResultBundle,
  )
  const summaryColumnIndex = getFieldIndex(
    ExpectedColumns.SUMMARY,
    queryResultBundle,
  )
  const linkColumnIndex = getFieldIndex(ExpectedColumns.LINK, queryResultBundle)

  return (
    <div className={`Goals${showDesktop ? '__Desktop' : ''}`}>
      {error && <ErrorBanner error={error} token={token} />}
      {queryResultBundle?.queryResult.queryResults.rows.map((el, index) => {
        const values = el.values
        const tableId =
          tableIdColumnIndex > -1 ? values[tableIdColumnIndex] : undefined
        let countSql
        if (countSqlColumnIndex > -1 && values[countSqlColumnIndex]) {
          countSql = values[countSqlColumnIndex]
        } else if (tableId) {
          countSql = `SELECT * FROM ${tableId}`
        }
        const title = values[titleColumnIndex]
        const summary = values[summaryColumnIndex]
        const link = values[linkColumnIndex]
        // assume that we recieve assets in order of rows and there is an asset for each item
        // can revisit if this isn't the case.
        const asset = assets?.[index] ?? ''
        const goalsDataProps: GoalsDataProps = {
          countSql,
          title,
          summary,
          link,
          asset,
          token,
        }
        return showDesktop ? (
          <GoalsDesktop {...goalsDataProps} />
        ) : (
          <GoalsMobile {...goalsDataProps} />
        )
      })}
    </div>
  )
}

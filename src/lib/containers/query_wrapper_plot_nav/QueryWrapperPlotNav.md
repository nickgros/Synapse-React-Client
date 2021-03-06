Configured to show cards:
```jsx
<QueryWrapperPlotNav token={sessionToken}  
  rgbIndex={1}
  name='Initiatives'
  sql='SELECT * from syn24189696'
  defaultShowFacetVisualization={false}
  shouldDeepLink={true}
  facetsToPlot={['fundingAgency']}
  searchConfiguration={{
    searchable: ['initiative'],
  }}

  cardConfiguration={{
    type: GENERIC_CARD,
    genericCardSchema: {
      type: 'Initiative',
      title: 'initiative',    
      description: 'summary',    
      link: 'website',
      imageFileHandleColumnName: 'image',
      // secondaryLabels: [
      //   'fundingAgency',
      //   'abbreviation',
      // ],
    },
    ctaButtonLinkConfig: {
      buttonText: 'Explore Studies',
      linkConfig: {
        matchColumnName: 'initiative',
        isMarkdown: false,
        baseURL: 'Explore/Initiatives/DetailsPage',
        URLColumnName: 'Initiative',
      }
    }
  }}
/>
```

Configured to show a table:
```jsx
<QueryWrapperPlotNav token={sessionToken}
  tableConfiguration={{
      showAccessColumn: true,
      showDownloadColumn: true,
      columnLinks: [
        {
          matchColumnName: 'study',
          isMarkdown: false,
          baseURL: 'Explore/Studies/DetailsPage',
          URLColumnName: 'Study_Name',
          wrapValueWithParens: true,
        },
      ],
    }}
    searchConfiguration={{
      searchable: ['assay','name','consortium'],
    }}
    visibleColumnCount={10}
    facetsToPlot={['assay']}
    rgbIndex={1}
    name='Table Demo'
    sqlOperator='='
    sql='SELECT assay, id FROM syn11346063 limit 1000'
  />
```
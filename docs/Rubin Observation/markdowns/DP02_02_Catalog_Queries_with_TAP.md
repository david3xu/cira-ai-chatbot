<img align="left" src = https://project.lsst.org/sites/default/files/Rubin-O-Logo_0.png width=250 style="padding: 10px"> 
<br><b>Catalog Queries with TAP (Table Access Protocol)</b> <br>
Contact authors: Leanne Guy <br>
Last verified to run: 2024-05-01 <br>
LSST Science Pipelines version: Weekly 2024_16 <br>
Container Size: medium <br>
Targeted learning level: beginner <br>

**Description:** Explore the DP0.2 catalogs via TAP and execute complex queries to retrieve data.

**Skills:** Use the TAP service. Query catalog data with ADQL. Visualize retrieved datasets.

**LSST Data Products:** Object, ForcedSource, CcdVisit tables.

**Packages:** lsst.rsp, bokeh, pandas

**Credit:**
Originally developed by Leanne Guy in the context of the Rubin DP0.1.

**Get Support:**
Find DP0-related documentation and resources at <a href="https://dp0.lsst.io">dp0.lsst.io</a>. Questions are welcome as new topics in the <a href="https://community.lsst.org/c/support/dp0">Support - Data Preview 0 Category</a> of the Rubin Community Forum. Rubin staff will respond to all questions posted there.

## 1. Introduction

This notebook provides an intermediate-level demonstration of how to use the Table Access Protocol (TAP) server and ADQL (Astronomy Data Query Language) to query and retrieve data from the DP0.2 catalogs.

TAP provides standardized access to catalog data for discovery, search, and retrieval.
Full <a href="http://www.ivoa.net/documents/TAP">documentation for TAP</a> is provided by the International Virtual Observatory Alliance (IVOA).
ADQL is similar to SQL (Structured Query Langage).
The <a href="http://www.ivoa.net/documents/latest/ADQL.html">documentation for ADQL</a> includes more information about syntax and keywords.

**Recommendation: review the ADQL recipes and other advice to optimize TAP queries** provided in the documentation for the DP0-era RSP's <a href="https://dp0-2.lsst.io/data-access-analysis-tools/index.html">Data Access and Analysis Tools</a>.

> **Warning:** Not all ADQL functionality is supported yet in the DP0 RSP.

### 1.1. Package imports

Import general python packages, the Rubin TAP service utilities, and bokeh and holoviews for interactive visualization.


```python
import numpy as np
import matplotlib.pyplot as plt
import pandas
from pandas.testing import assert_frame_equal
from astropy import units as u
from astropy.coordinates import SkyCoord
from lsst.rsp import get_tap_service, retrieve_query
import bokeh
from bokeh.io import output_file, output_notebook, show
from bokeh.layouts import gridplot
from bokeh.models import ColumnDataSource, CDSView, GroupFilter, HoverTool
from bokeh.plotting import figure
from bokeh.transform import factor_cmap
import holoviews as hv
```

### 1.2. Define functions and parameters

Set the maximum number of rows to display from pandas, and configure bokeh to generate output in notebook cells when show() is called.


```python
pandas.set_option('display.max_rows', 20)
output_notebook()
```

In general, the order of results from database queries cannot be assumed to be the same every time.
This function sorts the data so that we can compare the results dataframes even if the records are not in the same order from the query.
Since it is sorting, it also needs to reset the incremental index with `set_index`.


```python
def sort_dataframe(df, sort_key='objectId'):
    df = df.sort_values(sort_key)
    df.set_index(np.array(range(len(df))), inplace=True)
    return df
```

## 2. Explore the DP0.2 schema 

### 2.1. Create the Rubin TAP Service client

Get an instance of the TAP service, and assert that it exists.


```python
service = get_tap_service("tap")
assert service is not None
```

### 2.2. Schema discovery

To find out what schemas, tables and columns exist, query the Rubin TAP schema.

This information is also available in the "Data Products Definitions" section of the <a href="http://dp0-2.lsst.io">DP0.2 documentation</a>.

Create the query to find out what schemas are in the Rubin `tap_schema`, execute the query, 
and see that a `TAP Results` object is returned.


```python
query = "SELECT * FROM tap_schema.schemas"
results = service.search(query)
print(type(results))
```

Convert the results to an astropy table and display it.


```python
results = service.search(query).to_table()
results
```

### 2.3. The DP0.2 catalogs

All the DP0 tables (catalogs) are in the "dp02_dc2_catalogs" schema (table collection).

Search for the DP0 schema name and store as a variable.


```python
schema_names = results['schema_name']
for name in schema_names:
    if name.find('dp02') > -1:
        dp02_schema_name = name
        break
print("DP0.2 schema is " + dp02_schema_name)
```

Explore tables in the DP0.2 schema, ordering them by their database.
This is the order in which they will appear presented to the user in the RSP Portal.
Display the results to see the tables in the DP0.2 schema, which are the same tables that 
are presented via the Portal GUI, together with a description of each. 


```python
query = "SELECT * FROM tap_schema.tables " \
        "WHERE tap_schema.tables.schema_name = '" \
        + dp02_schema_name + "' order by table_index ASC"
print(query)

results = service.search(query)
results = results.to_table()
results
```

<br>
Useful terms related to TAP:

* `schema` - database terminology for the abstract design that represents the storage of data in a database. 
* `tap_schema` - the specific schema describing the TAP service. All TAP services must support a set of tables in a schema named TAP_SCHEMA that describe the tables and columns included in the service.
* `table collection` - a collection of tables. e.g., `dp02_dc2_catalogs`.
* `table` - a collection of related data held in a table format in a database, e.g., the object table (dp02_dc2_catalogs.Object).
* `results` - the query result set. The TAP service returns data from a query as a `TAPResults` object. Find more about `TAPResults` [here](https://pyvo.readthedocs.io/en/latest/api/pyvo.dal.TAPResults.html).

## 3. Query the DP0.2 Object catalog

The Object catalog (`dp02_dc2_catalogs.Object`) contains sources detected in the coadded images (also called stacked or combined images).

### 3.1. Get the columns available for a given table

Request the column names, data types, descriptions, and units for all columns in the Object catalog, and display as a Pandas table (which will automatically truncate).

Notice that there are 991 columns available in the Object table.


```python
results = service.search("SELECT column_name, datatype, description, unit from TAP_SCHEMA.columns "
                         "WHERE table_name = 'dp02_dc2_catalogs.Object'")
results.to_table().to_pandas()
```

There is no need to read through all the columns, which are also available in the "Data Products Definitions" section of the <a href="http://dp0-2.lsst.io">DP0.2 documentation</a>.

Search all column names for a specific term in order to find columns of interest.
For example, the next cell loops over all column names and, if a user-defined search string such as "coord" is found, prints the column name.


```python
search_string = 'coord'
for cname in results['column_name']:
    if cname.find(search_string) > -1:
        print(cname)
```

In the cell above, change the search string and execute the cell to find other columns
of interest, e.g., try "Flux", "flux", "blend", "z", etc.
One of those options yields no matches.

Clean up.


```python
del results
```

### 3.2. Cone search specifying the maximum number of records

>**RA, Dec constraints yield faster queries:**
The TAP-accessible tables are sharded by coordinate (RA, Dec).
ADQL query statements that include constraints by coordinate do not require a whole-catalog search, and are typically faster (and can be much faster) than ADQL query statements which only include constraints for other columns.

A cone search on the Object table will be a common TAP query.
In this example, a circle centered on (RA, Dec) = (62.0, -37.0), with a radius of 1 degree is used.

Define the central coordinates and search radius using Astropy `SkyCoord` and units.


```python
center_coords = SkyCoord(62, -37, frame='icrs', unit='deg')
search_radius = 1.0*u.deg

print(center_coords)
print(search_radius)
```

The TAP queries take the center coordinates and the search radius -- both in units of degrees -- as strings, so also define strings to use in the query statements below.


```python
use_center_coords = "62, -37"
use_radius = "1.0"
```

For debugging and testing queries, it is often useful to only return a few records for expediency.
This can be done in one of two ways, setting the `TOP` field in a query, or setting the `maxrec` parameter in the TAP service query.
The two methods produce identical results, as demonstrated below.

Define the maximum records to return.


```python
max_rec = 5
```

#### 3.2.1. Set TOP

Use the "TOP" option to set the maximum number of records.

Build a query to find bright objects with magnitude < 18 and an extendedness = 0 in the r-band filter.
Recall that it is always recommended to set `detect_isPrimary = True` (which means the source has no deblended children, to avoid returning both deblended *and* blended objects).

Order the results by descending flux, both in this example and the next -- otherwise, results are returned in random order and we would not be able to confirm that both methods for setting the number of records are equivalent.

> **Warning:** Combining use of TOP with ORDER BY in ADQL queries can be dangerous, as in, may take an unexpectedly long time because the database is trying to first sort, and *then* extract the top N elements. It is best to only combine TOP and ORDER BY if your query cuts down the number of objects that would need to be sorted, first. (Which is the case in the examples below).

Execute the query, and confirm that only 5 records were retrieved.


```python
query = "SELECT TOP " + str(max_rec) + " " + \
        "objectId, coord_ra, coord_dec, detect_isPrimary, " + \
        "g_cModelFlux, r_cModelFlux, r_extendedness, r_inputCount " + \
        "FROM dp02_dc2_catalogs.Object " + \
        "WHERE CONTAINS(POINT('ICRS', coord_ra, coord_dec), " + \
        "CIRCLE('ICRS', " + use_center_coords + ", " + use_radius + ")) = 1 " + \
        "AND detect_isPrimary = 1 " + \
        "AND r_extendedness = 0 " + \
        "AND scisql_nanojanskyToAbMag(r_cModelFlux) < 18.0 " + \
        "ORDER by r_cModelFlux DESC"
results = service.search(query)
assert len(results) == max_rec
```

#### 3.2.2. Set maxrec

Execute the same query using the maxrec parameter instead of TOP, name the output "results1" instead of "results", and confirm that only 5 records were retrieved.

Use of `maxrec` is *not* preferred, compared to `SELECT TOP`.
Most TAP services map `maxrec` to `SELECT TOP` on the back end anyways, and using `SELECT TOP` ensures that queries are copy-pasteable between interfaces (e.g., into the Portal Aspect).

> **Warning:** Use of `maxrec` might return a `DALOverflowWarning` to warn the user that partial results have been returned. In this case, it is ok to ignore this warning, because we *intended* to return partial results by using `maxrec`.


```python
query = "SELECT objectId, coord_ra, coord_dec, detect_isPrimary, " + \
        "g_cModelFlux, r_cModelFlux, r_extendedness, r_inputCount " + \
        "FROM dp02_dc2_catalogs.Object " + \
        "WHERE CONTAINS(POINT('ICRS', coord_ra, coord_dec), " + \
        "CIRCLE('ICRS', " + use_center_coords + ", " + use_radius + ")) = 1 " + \
        "AND detect_isPrimary = 1 " + \
        "AND r_extendedness = 0 " + \
        "AND scisql_nanojanskyToAbMag(r_cModelFlux) < 18.0 " + \
        "ORDER by r_cModelFlux DESC"
results1 = service.search(query, maxrec=max_rec)
assert len(results1) == max_rec
```

#### 3.2.3. Show the results from TOP and maxrec are identical

Convert the results to pandas data frames, and  assert that the contents of the two tables are identical.
There will be no output if they are identical.


```python
assert_frame_equal(sort_dataframe(results.to_table().to_pandas()),
                   sort_dataframe(results1.to_table().to_pandas()))
```

For more detailed analysis of results, converting to a pandas dataframe is often very useful


```python
results_table = results.to_table().to_pandas()
results_table
```


```python
results1_table = results1.to_table().to_pandas()
results1_table
```

Clean up.


```python
del results, results1, results_table, results1_table
```

### 3.3. Cone search with double table join 

Create a similar query as above, for bright, non-extended Objects within a 1 degree radius, but now join with the ForcedSource table to obtain PSF photometry from the r-band processed visit images (PVIs), and join with the CcdVisit table to obtain the visits' Modified Julian Dates (MJDs).

Do not set a maximum number of records to return, because the goal is to generate a table containing the ForcedSource photometry for all of the Objects of interest. There is no need to use ORDER BY for this example, but it could be.

> **Notice:** When restricting a JOIN query to just a portion of the sky (e.g., a cone search), restricting on coordinates in Object, DiaObject, or Source tables where possible can result in significantly improved performance.


```python
query = "SELECT fs.forcedSourceId, fs.objectId, fs.ccdVisitId, fs.detect_isPrimary, " + \
        "fs.band, scisql_nanojanskyToAbMag(fs.psfFlux) as psfMag, ccd.obsStartMJD, " + \
        "scisql_nanojanskyToAbMag(obj.r_psfFlux) as obj_rpsfMag " + \
        "FROM dp02_dc2_catalogs.ForcedSource as fs " + \
        "JOIN dp02_dc2_catalogs.CcdVisit as ccd " + \
        "ON fs.ccdVisitId = ccd.ccdVisitId " + \
        "JOIN dp02_dc2_catalogs.Object as obj " + \
        "ON fs.objectId = obj.objectId " + \
        "WHERE CONTAINS(POINT('ICRS', obj.coord_ra, obj.coord_dec), " + \
        "CIRCLE('ICRS', " + use_center_coords + ", " + use_radius + ")) = 1 " + \
        "AND obj.detect_isPrimary = 1 " + \
        "AND obj.r_extendedness = 0 " + \
        "AND scisql_nanojanskyToAbMag(obj.r_cModelFlux) > 17.5 " + \
        "AND scisql_nanojanskyToAbMag(obj.r_cModelFlux) < 18.0 " + \
        "AND fs.band = 'r' "
results = service.search(query)
```

Take a look at how the output results are formatted from joined tables. Notice the `obj_rpsfMag` column has the same value for all rows with the same `objectId`. The table join from ForcedSource to Object is a many-to-one match.


```python
results.to_table().to_pandas()
```

Investigate how many unique Objects were returned, and the distribution of the number of ForcedSources (visit images) per Object.


```python
unique_objectIds, counts = np.unique(results['objectId'], return_counts=True)
print(len(unique_objectIds), ' unique objects returned')

fig = plt.figure(figsize=(4, 2))
plt.hist(counts, bins=20)
plt.xlabel('Number of ForcedSources')
plt.ylabel('Number of Objects')
plt.show()
```

Plot the time series of ForcedSource r-band photometry for one of the Objects.
For this example, just take the first unique `objectId` from the list.


```python
use_objectId = unique_objectIds[0]

tx = np.where(results['objectId'] == use_objectId)[0]

fig = plt.figure(figsize=(6, 4))
plt.axhline(results['obj_rpsfMag'][tx[0]], ls='solid', color='black',
            label='Object r-band PSF Magnitude (from deepCoadd)')
plt.plot(results['obsStartMJD'][tx], results['psfMag'][tx],
         'o', ms=10, mew=0, alpha=0.5, color='firebrick',
         label='ForcedSource r-band PSF Magnitude (from PVIs)')
plt.xlabel('MJD')
plt.ylabel('r-band magnitude')
plt.title('objectId = ' + str(use_objectId))
plt.legend(loc='lower left')
plt.show()
```

Whether or not that randomly chosen Object is truly variable is left as an exercise for the learner.

Clean up.


```python
del results, use_objectId, unique_objectIds, counts
```

Here is an example of an alternative query string for obtaining the same data in the case where the `objectId` is already known -- meaning, a case in which the Object catalog does not need to be queried via any columns aside from `objectId`.

```
SELECT fs.forcedSourceId, fs.objectId, fs.ccdVisitId, fs.detect_isPrimary, 
fs.band, scisql_nanojanskyToAbMag(fs.psfFlux) as psfMag, ccd.obsStartMJD, 
scisql_nanojanskyToAbMag(obj.r_psfFlux) as obj_rpsfMag 
FROM dp02_dc2_catalogs.ForcedSource as fs 
JOIN dp02_dc2_catalogs.CcdVisit as ccd ON fs.ccdVisitId = ccd.ccdVisitId 
JOIN dp02_dc2_catalogs.Object as obj ON fs.objectId = obj.objectId 
WHERE fs.objectId = 1567762843720227098 AND fs.band = 'r'
```

## 4. Visualize large data sets resulting from a query

In this section, the **bokeh** package is used to create interactive plots to explore a dataset.
Multiple panels are used to show different representations of the same dataset.
A selection applied to either panel will highlight the selected points in the other panel.

<a href="https://bokeh.org/">Bokeh Documentation</a> <br>
<a href="https://holoviews.org/">Holoviews Documentation</a>

### 4.1. Data query

Select Objects within a central search area, with r-band magnitudes between 17 and 23 mag, and with a measured r-band extendedness parameter (that is not NaN or NULL).

Return the coordinates, gri magnitudes, and r-band extendedness. 

> **Notice:** The results are being converted to a Pandas table in the same line as the search is executed.


```python
query = "SELECT objectId, detect_isPrimary, " + \
        "coord_ra AS ra, coord_dec AS dec, " + \
        "scisql_nanojanskyToAbMag(g_cModelFlux) AS mag_g_cModel, " + \
        "scisql_nanojanskyToAbMag(r_cModelFlux) AS mag_r_cModel, " + \
        "scisql_nanojanskyToAbMag(i_cModelFlux) AS mag_i_cModel, " + \
        "r_extendedness " + \
        "FROM dp02_dc2_catalogs.Object " + \
        "WHERE CONTAINS(POINT('ICRS', coord_ra, coord_dec), " + \
        "CIRCLE('ICRS', " + use_center_coords + ", " + use_radius + ")) = 1 " + \
        "AND detect_isPrimary = 1 " + \
        "AND scisql_nanojanskyToAbMag(g_cModelFlux) > 17.0 " + \
        "AND scisql_nanojanskyToAbMag(g_cModelFlux) < 23.0 " + \
        "AND scisql_nanojanskyToAbMag(r_cModelFlux) > 17.0 " + \
        "AND scisql_nanojanskyToAbMag(r_cModelFlux) < 23.0 " + \
        "AND scisql_nanojanskyToAbMag(i_cModelFlux) > 17.0 " + \
        "AND scisql_nanojanskyToAbMag(i_cModelFlux) < 23.0 " + \
        "AND r_extendedness IS NOT NULL "
results = service.search(query).to_table().to_pandas()
```

Display the Pandas table.


```python
results
```

### 4.2. Data preparation

The basis for any data visualization is the underlying data.

The `ColumnDataSource` (CDS) is the core of bokeh plots.
A CDS can be prepared from the data returned by a query, enabling it to be passed directly to bokeh.
Bokeh automatically creates a CDS from data passed as python lists or numpy arrays.
CDS are useful as they allow data to be shared between multiple plots and renderers, enabling brushing and linking.
A CDS is essentially a collection of sequences of data that have their own unique column name. 

Getting the data preparation phase right is the key to creating powerful visualizations. 

Recall the center coordinates that were defined with `astropy` `SkyCoord`.
Get the central RA and Dec as values (datatype float) and print them.


```python
center_ra = center_coords.ra.deg
center_dec = center_coords.dec.deg
print(center_ra, center_dec)
```

Create a python dictionary that associates the `r_extendedness` column with the Object being a star or a galaxy.


```python
object_map = {0.0: 'star', 1.0: 'galaxy'}
```

Create a python dictionary to store the data from the query and pass to the `ColumnDataSource`.
All columns in a CDS must have the same length.


```python
data = dict(ra=results['ra'], dec=results['dec'],
            target_ra=results['ra']-center_ra,
            target_dec=results['dec']-center_dec,
            gmi=results['mag_g_cModel']-results['mag_i_cModel'],
            gmag=results['mag_g_cModel'],
            rmag=results['mag_r_cModel'],
            imag=results['mag_i_cModel'])
source = ColumnDataSource(data=data)
```

Additional data can be added to the CDS after creation, as
demonstrated in the cell below with the addition of `objectId` and `extendedness` in the r-band.

Note that the `objectId` needs to be converted to a string, 
because bokeh can't interpret an integer value that high.


```python
objIdString = np.array(results['objectId']).astype('str')
source.data['objectId'] = objIdString
source.data['r_extendedness'] = results['r_extendedness']
```

Use the `object_map` dictionary to add an `object_type` column to the CDS.


```python
source.data['object_type'] = results['r_extendedness'].map(object_map)
source.data['object_type']
```

### 4.3. Plot a color-magnitude diagram

Use bokeh to plot a color-magnitude (g vs. g-i) diagram making use of the `cModel` magnitudes.
Hover over the points in the plot to see their values.

Define the plot aesthetics and tools.


```python
plot_options = {'height': 400, 'width': 400,
                'tools': ['box_select', 'reset', 'box_zoom', 'help']}
```

Define the hover tool.


```python
tooltips = [
    ("Col (g-i)", "@gmi"),
    ("Mag (g)", "@gmag"),
    ("Mag (r)", "@rmag"),
    ("Mag (i)", "@imag"),
    ("Type", "@object_type")
]
hover_tool_cmd = HoverTool(tooltips=tooltips)
```

Create a color-magnitude diagram.


```python
p = figure(title="Color - Magnitude Diagram",
           x_axis_label='g-i', y_axis_label='g',
           x_range=(-1.8, 4.3), y_range=(23.5, 16),
           **plot_options)
```

Color-code the different object types by defining a color map palette.


```python
object_type_palette = ['darkred', 'lightgrey']
p.add_tools(hover_tool_cmd)
p.scatter(x='gmi', y='gmag', source=source,
         size=3, alpha=0.6,
         legend_field="object_type",
         color=factor_cmap('object_type',
                           palette=object_type_palette,
                           factors=['star', 'galaxy']),
         hover_color="darkblue")
```

Show the interactive plot.


```python
show(p)
```

### 4.4. Plot a color-color (r-i vs. g-r) diagram

Add a color-color (r-i vs. g-r) diagram and make use of the advanced linking features of bokeh 
to enable brushing and linking between the the color-magnitude diagram and this color-color plot.


```python
source.data['rmi'] = results['mag_r_cModel'] - results['mag_i_cModel']
source.data['gmr'] = results['mag_g_cModel'] - results['mag_r_cModel']
```

The CMD above is very crowded. Below, filter on object type and plot stars only.

Use a GroupFilter to select rows from the CDS that satisfy `object_type` = "star".


```python
stars = CDSView()
stars.filter = GroupFilter(column_name='object_type', group="star")
```

Define the various options for the plot, and create the hover tool.


```python
plot_options = {'height': 350, 'width': 350,
                'tools': ['box_zoom', 'box_select',
                          'lasso_select', 'reset', 'help']}

hover_tool = HoverTool(tooltips=[("(RA,DEC)", "(@ra, @dec)"),
                                 ("(g-r,g)", "(@gmr, @gmag)"),
                                 ("objectId", "@objectId"),
                                 ("type", "@object_type")])
```

Create the three plots: spatial, color-magnitude, and color-color, then plot all three together on a grid.

Create the spatial plot.


```python
title_spatial = 'Spatial centred on (RA,DEC) = '+use_center_coords

fig_spatial = figure(title=title_spatial,
                     x_axis_label="Delta RA", y_axis_label="Delta DEC",
                     **plot_options)
fig_spatial.scatter(x='target_ra', y='target_dec',
                   source=source, view=stars,
                   size=4.0, alpha=0.6,
                   color='teal', hover_color='firebrick')
fig_spatial.add_tools(hover_tool)
```

Create the color-magnitude plot.


```python
fig_cmag = figure(title="Color-Magnitude Diagram",
                  x_axis_label="g-r", y_axis_label="g",
                  x_range=(-1.0, 2.0), y_range=(23.5, 16),
                  **plot_options)
fig_cmag.scatter(x='gmr', y='gmag', source=source, view=stars,
                size=4.0, alpha=0.6,
                color='teal', hover_color='firebrick')
fig_cmag.add_tools(hover_tool)
```

Create the color-color plot.


```python
fig_cc = figure(title="Color-Color Diagram",
                x_axis_label="g-r", y_axis_label="r-i",
                x_range=(-1.0, 2.0), y_range=(-1.0, 2.5),
                **plot_options)
fig_cc.scatter(x='gmr', y='rmi', source=source, view=stars,
              size=4.0, alpha=0.6,
              color='teal', hover_color='firebrick')
fig_cc.add_tools(hover_tool)
```

Show all three plots together in a row.


```python
p = gridplot([[fig_spatial, fig_cmag, fig_cc]])
show(p)
```

Hover the mouse over the data points in any of the plots in order to 
use the hover tool to see information about individual data points (e.g., the `objectId`).
Notice the data points highlighted in red on one panel with the hover tool are also highlighted on the other panels.

Click on the box select or lasso select icons in the upper right corner of the figure. 
Use the box select or lasso select functionality to make a selection in any panel by clicking and dragging to define a region. 
The selected data points will be displayed in darker teal in all panels.

Use the refresh icon to reset the plot.

Clean up.


```python
del results, data, p, stars, source
```

## 5. Asynchronous TAP queries

All of the queries above were *synchronous* queries.
This means that the query will continue executing in the notebook until it is finished,
and no other cells can be executed during that time.
The Jupyter code cell will show the asterisk to the left of the cell until the query completes and the results are returned. 
The asterisk will then become a number. 
Synchronous queries are good for short queries that take seconds to minutes.

For longer queries, or for running multiple queries at the same time, an *asynchronous* query is more suitable. 
With asynchronous queries, other Jupyter cells can be executed while the query is running, and
results can be retrieved later.
This is especially important for queries that are long or return a lot of results, and it
also safeguards long queries against network outages or timeouts.

The results of a query will be the same whether it is run synchronously or asynchronously.

### 5.1. Define the query

Create a table join cone search query on the ForcedSource and CcdVisit tables, but with fewer conditions and a smaller radius than above.


```python
use_radius = "0.1"

query = "SELECT fs.forcedSourceId, fs.objectId, fs.ccdVisitId, " + \
        "fs.detect_isPrimary, fs.band, " + \
        "scisql_nanojanskyToAbMag(fs.psfFlux) as psfMag, ccd.obsStartMJD " + \
        "FROM dp02_dc2_catalogs.ForcedSource as fs " + \
        "JOIN dp02_dc2_catalogs.CcdVisit as ccd " + \
        "ON fs.ccdVisitId = ccd.ccdVisitId " + \
        "WHERE CONTAINS(POINT('ICRS', fs.coord_ra, fs.coord_dec), " + \
        "CIRCLE('ICRS', " + use_center_coords + ", " + use_radius + ")) = 1 " + \
        "AND scisql_nanojanskyToAbMag(fs.psfFlux) > 17.5 " + \
        "AND scisql_nanojanskyToAbMag(fs.psfFlux) < 18.0 " + \
        "AND fs.band = 'r' "

print(query)
```

### 5.2. Synchronous query

Run the synchronous query and wait for the results.
Notice that the query takes one to two minutes.


```python
results = service.search(query).to_table().to_pandas()
```


```python
len_sync_results = len(results)
print(len_sync_results)
```

### 5.3. Asynchronous query

Create and submit the job. This step does not run the query yet.

Then get the job URL and the job phase. It will be "pending" until the job is started.


```python
job = service.submit_job(query)

print('Job URL is', job.url)

print('Job phase is', job.phase)
```

Run the job, and see that the cell completes executing, even though the query is still running.
Notice how waiting one to two minutes until another cell can be executed is not necessary with the asynchronous query, as it was with the synchronous version above.


```python
job.run()
```

**Option:** Use the following cell to tell python to wait for the job to finish. 
Only do this if there is no neeed to run anything else while waiting.
The cell will continue executing until the job is finished (i.e., either the status `COMPLETED` or `ERROR` is returned).
An asterisk will appear to the left of the cell until the job is finished,
just like with a synchronous query.


```python
job.wait(phases=['COMPLETED', 'ERROR'])
print('Job phase is', job.phase)
```

A useful function to raise an exception if there was a problem with the query.


```python
job.raise_if_error()
```

Once the job completes successfully, fetch the results.


```python
async_results = job.fetch_result().to_table().to_pandas()
```

Assert that the length of the results of the asynchronous and synchronous executions of the query statement are the same.


```python
assert len(async_results) == len_sync_results
```

Assert that the actual results are the same as obtained from executing synchronous queries. 

Above, the `sort_dataframe` function was used with the default sort key, `objectId`, 
but this time the `objectId` is not unique in the results dataframes and so the `forcedSourceId` must be used.


```python
assert_frame_equal(sort_dataframe(results, sort_key='forcedSourceId'),
                   sort_dataframe(async_results, sort_key='forcedSourceId'))
```

### 5.4. Retrieve the results from a previous asynchronous job

Job results are generally available from previously run queries,
and can be retrieved if the URL of the job is known.

The code cell below gets the URL for the query above and prints it,
then retrieves the results of the job and again asserts that the
length is the same as the synchronous query results, and that
the two dataframes are equal.


```python
print(job.url)
retrieved_job = retrieve_query(job.url)

retrieved_results = retrieved_job.fetch_result().to_table().to_pandas()

assert len(retrieved_results) == len_sync_results

assert_frame_equal(sort_dataframe(retrieved_results, sort_key='forcedSourceId'),
                   sort_dataframe(async_results, sort_key='forcedSourceId'))
```

### 5.5. Delete the job

Once the job is finished and the results have been retrieved and analyzed 
(or if analysis revealed a mistake) 
delete the job and the results from the server. 

Note that results will be deleted automatically if the notebook kernel is restarted.


```python
job.delete()
```

Clean up.


```python
del results, async_results, retrieved_results
```

## 6. Retrieve the results of a Portal query

It is also possible to retrieve the results of queries executed in the Portal Aspect of the Rubin Science Platform.

In a new browser tab, go to <a href="">data.lsst.cloud</a> and enter the Portal Aspect.

Click "Edit ADQL" at upper right, and copy-paste the following query into the ADQL box as shown in the screenshot below.

This query selects bright point sources within a 1 degree radius near the center of the DC2 region.

```
SELECT coord_dec, coord_ra, g_calibFlux, i_calibFlux, r_calibFlux 
FROM dp02_dc2_catalogs.Object 
WHERE CONTAINS (POINT('ICRS', coord_ra, coord_dec), CIRCLE('ICRS', 62.0, -37.0, 1)) = 1 
AND detect_isPrimary =1 
AND g_calibFlux >360 AND g_extendedness =0 
AND i_calibFlux >360 AND i_extendedness =0 
AND r_calibFlux >360 AND r_extendedness =0 
```

Click "Search".

<img src="data/DP02_02_S6_fig1.png" width=700>

The default results view will appear as in the screenshot below.

<img src="data/DP02_02_S6_fig2.png" width=700>

The search results have been automatically saved and assigned a URL.

Retrieve the URL by clicking the "Info" button (the letter i in a circle)
to the upper-right of the table.
The pop-up window contains the URL (the Job Link).

<img src="data/DP02_02_S6_fig3.png" width=500>

> **Warning:** Using the job link above will not work, it has expired.

Follow the instructions above to execute the query and obtain the URL.

Copy the URL into the empty quotes below to define `my_portal_url`.

Uncomment and execute the following cell to obtain the results of 
the Portal query here in the Notebook, as `my_portal_results`.


```python
# my_portal_url = ''
# my_portal_job = retrieve_query(my_portal_url)
# my_portal_results = my_portal_job.fetch_result().to_table().to_pandas()
# my_portal_results
```

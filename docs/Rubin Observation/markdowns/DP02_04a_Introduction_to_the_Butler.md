<img align="left" src = https://project.lsst.org/sites/default/files/Rubin-O-Logo_0.png width=250 style="padding: 10px"> 
<br><b>Introduction to Data Access with the Butler</b> <br>
Contact author(s): Alex Drlica-Wagner <br>
Last verified to run: 2024-05-01 <br>
LSST Science Pipelines version: Weekly 2024_16 <br>
Container Size: large <br>
Targeted learning level: beginner <br>

**Description:** This notebook uses the Butler to query DP0 images and catalogs.

**Skills:** Query and retrieve images and catalog data with the Butler.

**LSST Data Products:** Images (calexp, goodSeeingDiff_differenceExp, deepCoadd) and catalogs (sourceTable, diaSourceTable, objectTable, forcedSourceTable, forcedSourceOnDiaObjectTable).

**Packages:** lsst.daf.butler

**Credit:** This tutorial was originally developed by Alex Drlica-Wagner.

**Get Support:**
Find DP0-related documentation and resources at <a href="https://dp0.lsst.io">dp0.lsst.io</a>. Questions are welcome as new topics in the <a href="https://community.lsst.org/c/support/dp0">Support - Data Preview 0 Category</a> of the Rubin Community Forum. Rubin staff will respond to all questions posted there.

## 1. Introduction

The Butler is the LSST Science Pipelines interface for managing, reading, and writing datasets. The Butler can be used to explore the contents of the DP0 data repository and access the DP0 data. The current version of the Butler (referred to as "Gen3") is still under development, and this notebook may be modified in the future. Full Butler documentation can be found [here](https://pipelines.lsst.io/modules/lsst.daf.butler/index.html).

This notebook demonstrates how to:<br>
1. Create an instance of the Butler<br>
2. Use the Butler to retrieve image data<br>
3. Use the Butler to retrieve catalog data<br>

### 1.1. Import packages

Import general python packages and several packages from the LSST Science Pipelines, including the Butler package and AFW Display, which will be used to display images.
More details and techniques regarding image display with `AFW Display` can be found in the `rubin-dp0` GitHub Organization's [tutorial-notebooks](https://github.com/rubin-dp0/tutorial-notebooks) repository.


```python
# Generic python packages
import pylab as plt
import gc
import numpy as np

# LSST Science Pipelines (Stack) packages
import lsst.daf.butler as dafButler
import lsst.afw.display as afwDisplay

# Set a standard figure size to use
plt.rcParams['figure.figsize'] = (8.0, 8.0)
afwDisplay.setDefaultBackend('matplotlib')
```

## 2. Create an instance of the Butler

To create the Butler, we need to provide it with a configuration for the data set (often referred to as a "data repository").
This configuration can be the path to a yaml file (often named `butler.yaml`), a directory path (in which case the Butler will look for a `butler.yaml` file in that directory), or a shorthand repository label (i.e., `dp02`). If no configuration is passed, the Butler will use a default value (this is not recommended in most cases).
For the purposes of accessing the DP0.2 data, we will use the `dp02` label.

In addition to the config, the Butler also takes a set of data `collections`. 
Collections are lightweight groups of self-consistent datasets such as raw images, calibration files, reference catalogs, and the outputs of a processing run.
You can find out more about collections [here](https://pipelines.lsst.io/v/weekly/modules/lsst.daf.butler/organizing.html#collections).
For the purposes of accessing the DP0.2 data, we will use the `2.2i/runs/DP0.2` collection. 
Here, '2.2i' refers to the imSim run that was used to generated the simulated data and 'runs' refers to the fact that it is processed data.

Create an instance of the Butler pointing to the DP0.2 repository.


```python
config = 'dp02'
collections = '2.2i/runs/DP0.2'
butler = dafButler.Butler(config, collections=collections)
```

Learn more about the Butler by uncommenting the following line and executing the cell.


```python
# help(butler)
```

## 3. Butler image access

The Butler can be used to access DP0 image data products. The DP0.2 [Data Products Definition Document (DPDD)](https://dp0-2.lsst.io/data-products-dp0-2/index.html#images) describes three different types of image data products: processed visit images (PVIs; `calexp`),  difference images (`goodSeeingDiff_differenceExp`), and coadded images (`deepCoadd`). We will demonstrate how to access each of these.

In order to access a data product through the Butler, we will need to tell the Butler what data we want to access. This call generally has two components: the `datasetType` tells the Butler what type of data product we are seeking (e.g., `deepCoadd`, `calexp`, `objectTable`), and the `dataId` is a dictionary-like identifier for a specific data product (more info on dataIds can be found [here](https://pipelines.lsst.io/v/weekly/modules/lsst.daf.butler/dimensions.html#data-ids)).

### 3.1. Processed Visit Images

Processed visit images can be accessed with the `calexp` datasetType. 
These are image data products derived from processing of a single detector in a single visit of the LSST Camera. 
To access a `calexp`, the minimal information that we will need to provide is the visit number and the detector number. 


```python
datasetType = 'calexp'
dataId = {'visit': 192350, 'detector': 175}
calexp = butler.get(datasetType, dataId=dataId)
```

To view all parameters that can be passed to the dataId for calexp, we can use the Butler registry.


```python
print(butler.registry.getDatasetType(datasetType))
```

Plot a calexp.


```python
fig = plt.figure()
display = afwDisplay.Display(frame=fig)
display.scale('asinh', 'zscale')
display.mtv(calexp.image)
plt.show()
```

Clean up.


```python
del calexp
gc.collect()
```

### 3.2. Difference Images

Difference images can be accessed with the `goodSeeingDiff_differenceExp` datasetType. 
These are PVIs which have had a template image subtracted from them. 
These data products are used to measure time-varying difference in the fluxes of astronomical sources.
To access a difference image we require the visit and detector.


```python
datasetType = 'goodSeeingDiff_differenceExp'
dataId = {'visit': 192350, 'detector': 175}
diffexp = butler.get(datasetType, dataId=dataId)
```

Plot a goodSeeingDiff_differenceExp.


```python
fig = plt.figure()
display = afwDisplay.Display(frame=fig)
display.scale('asinh', 'zscale')
display.mtv(diffexp.image)
plt.show()
```

Clean up.


```python
del diffexp
gc.collect()
```

### 3.3. Coadded Images

Coadded images combine multiple PVIs to assemble a deeper image; they can be accessed with the `deepCoadd` datasetType.
Coadd images are divided into “tracts” (a spherical convex polygon) and tracts are divided into “patches” (a quadrilateral sub-region, with a size in pixels chosen to fit easily into memory on desktop computers). 
Coadd patches are roughly the same size as a single-detector `calexp` image.
To access a `deepCoadd`, we need to specify the tract, patch, and band that we are interested in.


```python
datasetType = 'deepCoadd'
dataId = {'tract': 4431, 'patch': 17, 'band': 'i'}
coadd = butler.get(datasetType, dataId=dataId)
```

Plot a deepCoadd.


```python
fig = plt.figure()
display = afwDisplay.Display(frame=fig)
display.scale('asinh', 'zscale')
display.mtv(coadd.image)
plt.show()
```

Clean up.


```python
del coadd
gc.collect()
```

## 4. Butler table access

While the preferred technique to access DP0 catalogs is through the table access protocol (TAP) service, the Butler can also provide access to these data products. 
We will demonstrate how to access several different [catalog products described in the DPDD](https://dp0-2.lsst.io/data-products-dp0-2/index.html#catalogs). 
The catalogs are returned by the Butler as pandas DataFrame objects, which can be further manipulated by the user.
The full descriptions of the column schema from the DP0.2 tables can be found [here](https://dm.lsst.org/sdm_schemas/browser/dp02.html).

### 4.1. Processed Visit Sources

The `sourceTable` provides astrometric and photometric measurements for sources detected in the individual PVIs (`calexp`). 
Thus, to access the `sourceTable` for a specific PVI, we require similar information as was used to access the `calexp`.
More information on the columns of the `sourceTable` can be found [here](https://dm.lsst.org/sdm_schemas/browser/dp02.html#Source).


```python
datasetType = 'sourceTable'
dataId = {'visit': 192350, 'detector': 175}
src = butler.get(datasetType, dataId=dataId)
print(f"Retrieved catalog of {len(src)} sources.")
```

Display the table.


```python
src
```

Clean up.


```python
del src
gc.collect()
```

### 4.2. Difference Image Sources

The `diaSourceTable` provides astrometric and photometric measurements for sources detected in the difference images. 
To access the `diaSourceTable` for a specific difference image, we require similar information as was used to access the difference image itself.
However, the `diaSourceTable` groups together all sources detected in a single visit, and thus the detector number is not used.
More information on the columns of the `diaSourceTable` can be found [here](https://dm.lsst.org/sdm_schemas/browser/dp02.html#DiaSource).


```python
datasetType = 'diaSourceTable'
dataId = {'visit': 192350}
dia_src = butler.get(datasetType, dataId=dataId)
print(f"Retrieved catalog of {len(dia_src)} DIA sources.")
```

Display the table.


```python
dia_src
```

To retrieve sources from a specific detector, we can select a subset of the sources returned by our query to the `diaSourceTable`. In particular, we note that the `ccdVisitId` column contains a value that combines the visit and detector IDs. We could build this value with some simple Python string formatting; however, the more robust way is to ask the Butler what this value should be.


```python
dataId = {'visit': 192350, 'detector': 5}
det_string = str(dataId['detector'])
ccd_visit_id = np.longlong(str(dataId['visit'])+det_string.rjust(3, '0'))
selection = dia_src['ccdVisitId'] == ccd_visit_id
dia_src_ccd = dia_src[selection]
print(f"Found catalog of {len(dia_src_ccd)} DIA sources associated with {dataId}.")
```

Display the table selection.


```python
dia_src_ccd
```

Clean up.


```python
del dia_src, selection, dia_src_ccd
gc.collect()
```

### 4.3. Coadd Objects

The `objectTable` provides astrometric and photometric measurements for objects detected in coadded images. 
These objects are assembled across the set of coadd images in all bands, and thus contain multi-band photometry. 
For this reason, we do not specify the band in the `dataId`.
More information on the columns of the `objectTable` can be found [here](https://dm.lsst.org/sdm_schemas/browser/dp02.html#Object).


```python
datasetType = 'objectTable'
dataId = {'tract': 4431, 'patch': 17}
obj = butler.get(datasetType, dataId=dataId)
print(f"Retrieved catalog of {len(obj)} objects.")
```


```python
obj
```


```python
del obj
gc.collect()
```

### 4.4. Difference Image Objects

The `diaObjectTable` contains derived summary parameters for DIA sources associated by sky location and includes lightcurve statistics (e.g., flux chi2, Stetson J).
The DIA objects can be accessed from the `diaObjectTable_tract` table. 
As implied by the table name, it is intended to be queried by coadd tract.
More information on the `diaObjectTable_tract` can be found [here](https://dm.lsst.org/sdm_schemas/browser/dp02.html#DiaObject).


```python
datasetType = 'diaObjectTable_tract'
dataId = {'tract': 4431}
dia_obj = butler.get(datasetType, dataId=dataId)
print(f"Retrieved catalog of {len(dia_obj)} DIA objects.")
```


```python
dia_obj
```


```python
del dia_obj
gc.collect()
```

### 4.5. Forced Photometry Sources

Forced photometry refers to the process of fitting for a source at a specific location in an image regardless of whether the source has been detected in that image. 
This is useful when objects are not detected in all bands (e.g., drop outs) or observations (e.g., transient or variable objects). 
The `forcedSourceTable` contains forced photometry performed on the individual PVIs at the locations of all detected objects and linked to the `objectTable`.
In contrast, the `forcedSourceOnDiaObjectTable` contains forced photometry on the individual PVIs at the locations of all objects in the `diaObjectTable`.
Note that the tables returned by these butler queries are quite large and can fill up the memory available to your notebook.

More information on the columns of the `forcedSourceTable` can be found [here](https://dm.lsst.org/sdm_schemas/browser/dp02.html#ForcedSource), and the columns of the `forcedSourceOnDiaObjectTable` are similar.

> **Warning:** forcedSourceTable takes dataIds comprised of tract and patch only, which returns too many sources for a Jupyter Notebook with a small or medium container.

Instead of forcedSourceTable, it is recommended to use forcedSource (which takes dataIds comprised of e.g., band, instrument, detector, and visit) and to apply spatial and temporal constraints whenever applicable.
This is considered intermediate-level use of the Butler, and so is demonstrated in DP0.2 tutorial notebook 04b.

**Only uncomment and execute the three cells below if you are using a large container.**


```python
# datasetType = 'forcedSourceTable'
# dataId = {'tract': 4431, 'patch': 16, 'band':'i'}
# forced_src = butler.get(datasetType, dataId=dataId)
# print(f"Retrieved catalog of {len(forced_src)} forced sources.")
```


```python
# forced_src
```


```python
# del forced_src
# gc.collect()
```

Query the forcedSourceOnDiaObjectTable.
This will execute with a medium container.


```python
datasetType = 'forcedSourceOnDiaObjectTable'
dataId = {'tract': 4431, 'patch': 16}
dia_forced_src = butler.get(datasetType, dataId=dataId)
print(f"Retrieved catalog of {len(dia_forced_src)} DIA forced sources.")
```


```python
dia_forced_src
```


```python
del dia_forced_src
gc.collect()
```

## 5. Summary

In this notebook we demonstrated Butler access for a set of image and catalog data products described in the [DPDD for DP0.2](https://dp0-2.lsst.io/data-products-dp0-2/index.html#dp0-2-data-products-definition-document-dpdd). 
However, we have not demonstrated the powerful capability of the Butler to query the holdings of a data repository.
The full power of the Butler can be found in the [Butler documentation](https://pipelines.lsst.io/modules/lsst.daf.butler/index.html),
or in DP0.2 tutorial notebook 04b "Intermediate Butler Queries".

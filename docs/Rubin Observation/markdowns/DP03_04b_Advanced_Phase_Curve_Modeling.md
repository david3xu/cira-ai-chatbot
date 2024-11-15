<img align="left" src = https://project.lsst.org/sites/default/files/Rubin-O-Logo_0.png width=250 style="padding: 10px"> 
<br>
<b>Phase Curve of Solar System Objects</b> <br>
Contact authors: Yumi Choi and Christina Williams<br>
Last verified to run: 2024-05-01 <br>
LSST Science Piplines version: Weekly 2024_16 <br>
Container Size: medium <br>
Targeted learning level: advanced <br>

**Description:** Explicitly investigate the derivation of phase curves for Main Belt asteroids.

**Skills:** Use the TAP service and ADQL to access the DP0.3 tables. Join information from multiple DP0.3 tables. Derive phase curves using three different models.

**LSST Data Products:** TAP tables dp03_catalogs_10yr.SSObject, dp03_catalogs_10yr.MPCORB, dp03_catalogs_10yr.DiaSource, dp03_catalogs_10yr.SSSource

**Packages:** lsst.rsp.get_tap_service

**Credit:**
Inspired by a jupyter notebook developed by Queen's University Belfast Planet Lab (including Brian Rogers, Niall McElroy, and Meg Schwamb). Standalone functions for phase curve fitting were developed by Pedro Bernardinelli. References: <a href="https://ui.adsabs.harvard.edu/abs/2010Icar..209..542M/abstract">Muinonen et al. (2010)</a> and <a href="http://astronotes.co.uk/blog/2018/05/28/determining-the-h-g-parameters-of-atlas-asteroid-phase-curves.html">David Young's webpage.</a> Please consider acknowledging them if this notebook is used for the preparation of journal articles, software releases, or other notebooks.

**Get Support:** Find DP0 documentation and resources at <a href="https://dp0.lsst.io">dp0.lsst.io</a>. Questions are welcome as new topics in the <a href="https://community.lsst.org/c/support/dp0">Support - Data Preview 0 Category</a> of the Rubin Community Forum. Rubin staff will respond to all questions posted there.

## 1. Introduction

This notebook targets for an advanced user who is interested in understanding phase curve fitting in DP0.3 in detail. This notebook will explicitly explore three different functional forms that are broadly used for modeling a phase curve of an asteroid, and make a comparison with the `H` and `G12` parameters stored in the `SSObject` table. Please refer to the Introduction of the companion tutorial notebook 04a for definition of the phase curve. Only the most relevent parts to this tutorial are repeated here.

Modeling the phase curve (reduced magnitude $H(α)$ as a function of phase angle $α$) enables measurement of the absolute magnitude, $H$, defined as the brightness at 0 phase angle. The functional form can depend on the data quality and type of object targeted. This tutorial will explore three functional forms that are relevant for understanding the DP0.3 data products: `HG_model`, `HG1G2_model`, and `HG12_model`. The `HG_model` is the simplest model, and has the form:

$$H(α)=H−2.5log_{10}[(1−G)Φ_1(α)+GΦ_2(α)],$$

where $Φ_n$ are basis functions (which allow for one to model non-linearity in the data, but maintain linearity in the fitted parameters). $Φ_n$ are normalized to unity at α=0 deg. This model provides a best fit for the slope parameter $G$ (from which surface properties can then be derived) and the absolute magnitude $H$. $H$(α) is the reduced magnitude at a given phase angle α if measured at 1 au away from both Earth and from the Sun (i.e. unit topocentric and heliocentric distance). The `HG_model` $G$ and $H$ values are stored in the `dp03_catalogs_10yr.MPCORB` table. For further info on the `HG_model`, see [Bowell et al. 1989](https://ui.adsabs.harvard.edu/abs/1989aste.conf..524B/abstract). 

To better accommodate various observational effects (e.g., photometric quality, incomplete phase angle sampling) the more sophisticated `HG1G2_model` (a linear three-parameter function) and its nonlinear two-parameter version `HG12_model` were developed (see [Muinonen et al. 2010](https://ui.adsabs.harvard.edu/abs/2010Icar..209..542M/abstract)). The `HG1G2_model` has the form

$$H(α)=H−2.5log_{10}[G_1Φ_1(α)+G_2Φ_2(α) + (1-G_1-G_2)Φ3(α)],$$

which now has three free parameters, $H$, $G_1$ and $G_2$. However, a third representation, the `HG12_model`, is generally very effective for deriving reliable values of absolute magnitude when the phase angle sampling is not optimal (e.g., poor phase angle coverage at a range of phase angle). Thus, the LSST data products will compute estimated parameters of the `HG12_model` and this will be the focus of this tutorial. The `HG12_model` expresses the $G_1$ and $G_2$ parameters as a piecewise linear function of a single parameter, $G_{12}$, 

for $G_{12}$ > 0.2,
$$G_1 = 0.9529\times G_{12} + 0.02162,$$
$$G_2 = -0.6125\times G_{12} + 0.5572,$$
for $G_{12}$ < 0.2,
$$G_1 = 0.7527\times G_{12} + 0.06164,$$
$$G_2 = -0.9612\times G_{12} + 0.6270.$$

This notebook presents an illustrative example of deriving the phase curve of Main Belt asteroids using DP0.3 simulated catalogs. In Section 2, we will retrieve the necessary data from the DP0.3 database. Section 3 will delve into manual phase curve fitting for a single object using three different parametrizations of the phase curve model. In Section 4, we will then compare this manual fitting to the automated phase curve fitting carried out as part of the LSST data products, which are available in the SSObject table.

### 1.1 Package Imports

The [matplotlib](https://matplotlib.org/) (and especially sublibrary `matplotlib.pyplot`), [numpy](http://www.numpy.org/), and [scipy](https://scipy.org/) libraries are widely used Python libraries for plotting and scientific computing, and model fitting.

The `lsst.rsp` package provides access to the Table Access Protocol (TAP) service for queries to the DP0 catalogs.

The [pandas](https://pandas.pydata.org/) package enables table and dataset manipulation.

The [sbpy](https://sbpy.org) package is an `Astropy` affiliated package for small-body planetary astronomy.


```python
# general python packages
import numpy as np
from scipy.optimize import leastsq
import matplotlib.pyplot as plt
import pandas as pd
from sbpy.photometry import HG, HG12, HG1G2
from sbpy.data import Obs

# LSST package for TAP queries
from lsst.rsp import get_tap_service
```

### 1.2 Define Functions and Parameters

#### 1.2.1 Set up some plotting defaults


```python
plt.style.use('tableau-colorblind10')
params = {'axes.labelsize': 15,
          'font.size': 15,
          'legend.fontsize': 12}
plt.rcParams.update(params)
```

Set up colors and plot symbols corresponding to the $g,r,i,z$ bands since there are no $u$ and $y$ band data in the DP0.3 catalogs. These colors are the same as those used for $g,r,i,z$ bands in Dark Energy Survey (DES) publications, and are defined in <a href="https://github.com/DarkEnergySurvey/descolors">this github repository</a>.


```python
filts = ['g', 'r', 'i', 'z']
filter_colors = {'g': '#008060', 'r': '#ff4000', 'i': '#850000', 'z': '#6600cc'}
```

#### 1.2.2 Define functions for phase curve fitting 

The following cells define functions to perform the model fitting using the phase curve evalution functions available from the `sbpy` package.


```python
def weighted_dev(params, mag, phase, mag_err, model):
    """
    Compute weighted deviation for a given model.
    
    Parameters
    ----------
    params: list
        phase curve parameters
    mag: ndarray
        reduced magnitude
    phase: ndarray
        phase angle in radians
    mag_err: ndarray
        uncertainty in magnitude
    model: function
        phase curve model function
    

    Returns
    -------
    sol: tuple
        best-fit solution
    """

    if model is HG1G2.evaluate:
        pred = model(phase, params[0], params[1], params[2])
    else:
        pred = model(phase, params[0], params[1])

    return (mag - pred)/mag_err
```


```python
def fitPhaseCurve(mag, phase, sigma, model=HG12.evaluate, params=[0.1]):
    """
    Fit phase curve for given observations to a designated model.

    Parameters
    ----------
    mag: ndarray
        reduced magnitude
    phase: ndarray
        phase angle in degrees
    sigma: ndarray
        uncertainty in magnitude
    model: function (default=HG12.evaluate)
        phase curve model function
    params: list (default=[0.1])
        phase curve parameters

    Returns
    -------
    sol: tuple
        best-fit solution
    """

    phase = np.deg2rad(phase)
    sol = leastsq(weighted_dev, [mag[0]] + params, (mag, phase, sigma, model),
                  full_output=True)

    return sol
```


```python
def fitAllPhaseCurveModels(reducedMag, magSigma, phaseAngle, verbose=False):
    """
    Fit phase curves for given observations to three different models,
    the HG (sol_HG), HG12 (sol_HG12) and HG1G2 (sol_HG1G2), and 
    store the resulting solutions in a dictionary of dictionaries. 
    Save np.nan values when the fit is not converged.

    Parameters
    ----------
    reducedMag: ndarray
        reduced magnitude
    magSigma: ndarray
        uncertainty in magnitude
    phaseAngle: ndarray
        phase angle in degrees

    Returns
    -------
    solutions: dict
        Best-fit solutions for each model
    """

    solutions = {}

    sol_HG = fitPhaseCurve(reducedMag, phaseAngle, magSigma, model=HG.evaluate)

    solutions['HG'] = {}
    try:
        solutions['HG']['chi2'] = np.sum(sol_HG[2]['fvec']**2)
        solutions['HG']['H'] = sol_HG[0][0]
        solutions['HG']['G'] = sol_HG[0][1]
        solutions['HG']['H_err'] = np.sqrt(sol_HG[1][0, 0])
        solutions['HG']['G_err'] = np.sqrt(sol_HG[1][1, 1])
        solutions['HG']['cov'] = sol_HG[1]
    except TypeError:
        if verbose:
            print('HG model is not converging')
        solutions['HG']['chi2'] = np.nan
        solutions['HG']['H'] = np.nan
        solutions['HG']['G'] = np.nan
        solutions['HG']['H_err'] = np.nan
        solutions['HG']['G_err'] = np.nan
        solutions['HG']['cov'] = np.nan

    sol_HG12 = fitPhaseCurve(reducedMag, phaseAngle,
                             magSigma, model=HG12.evaluate)

    solutions['HG12'] = {}
    try:
        solutions['HG12']['chi2'] = np.sum(sol_HG12[2]['fvec']**2)
        solutions['HG12']['H'] = sol_HG12[0][0]
        solutions['HG12']['G12'] = sol_HG12[0][1]
        solutions['HG12']['H_err'] = np.sqrt(sol_HG12[1][0, 0])
        solutions['HG12']['G12_err'] = np.sqrt(sol_HG12[1][1, 1])
        solutions['HG12']['cov'] = sol_HG12[1]
    except TypeError:
        if verbose:
            print('HG12 model is not converging')
        solutions['HG12']['chi2'] = np.nan
        solutions['HG12']['H'] = np.nan
        solutions['HG12']['G12'] = np.nan
        solutions['HG12']['H_err'] = np.nan
        solutions['HG12']['G12_err'] = np.nan
        solutions['HG12']['cov'] = np.nan

    sol_HG1G2 = fitPhaseCurve(reducedMag, phaseAngle, magSigma,
                              model=HG1G2.evaluate, params=[0.1, 0.1])

    solutions['HG1G2'] = {}
    try:
        solutions['HG1G2']['chi2'] = np.sum(sol_HG1G2[2]['fvec']**2)
        solutions['HG1G2']['H'] = sol_HG1G2[0][0]
        solutions['HG1G2']['G1'] = sol_HG1G2[0][1]
        solutions['HG1G2']['G2'] = sol_HG1G2[0][2]
        solutions['HG1G2']['H_err'] = np.sqrt(sol_HG1G2[1][0, 0])
        solutions['HG1G2']['G1_err'] = np.sqrt(sol_HG1G2[1][1, 1])
        solutions['HG1G2']['G2_err'] = np.sqrt(sol_HG1G2[1][2, 2])
        solutions['HG1G2']['cov'] = sol_HG1G2[1]
    except TypeError:
        if verbose:
            print('HG1G2 model is not converging')
        solutions['HG1G2']['chi2'] = np.nan
        solutions['HG1G2']['H'] = np.nan
        solutions['HG1G2']['G1'] = np.nan
        solutions['HG1G2']['G2'] = np.nan
        solutions['HG1G2']['H_err'] = np.nan
        solutions['HG1G2']['G1_err'] = np.nan
        solutions['HG1G2']['G2_err'] = np.nan
        solutions['HG1G2']['cov'] = np.nan

    return solutions
```

## 2. Query the DP0.3 tables for Main Belt asteroids

### 2.1 Create the Rubin TAP Service Client

Get an instance of the TAP service, and assert that it exists.


```python
service = get_tap_service("ssotap")
assert service is not None
```

### 2.2 Query the DP0.3 SSObject and MPCORB catalogs

The phase curve modeling requires apparent magnitudes & uncertainties, phase angles, topocentric ($d_t$) and heliocentric ($d_h$) distances.

To define the properties of solar system objects, the DP0.3 model uses the `HG_model` form of the phase curve to simulate Rubin observations for each object. These "truth" values are defined in the MPCORB table as `mpcH` (intrinsic absolute magnitude in $V$ band) and `mpcG` (intrinsic slope). For the DP0.3 simulations, the intrinsic slope, `mpcG`, for all objects was set to a constant value of 0.15.

In the SSObject table, the LSST data products also contain the fitted phase curve parameters based on the mock observations using the `HG12_model` (i.e. contain absolute magnitude `H` and slope parameter `G12` in $g,r,i,z$ bands). Note that the value of `G12` slope will differ from `G` owing to the difference in functional form. The explanation for the absence of $u$ and $y$ bands in DP0.3 catalogs can be found in the <a href="https://dp0-3.lsst.io/data-products-dp0-3/data-simulation-dp0-3.html">DP0.3 documentation</a>.

To focus on Main Belt asteroids that likely have good phase curve fits for this tutorial, the query is limited to select sources with a large number of observations (in the SSObject table, this is `numObs` > 2000) and with 2.0 au < semi-major axis (`a`) < 3.2 au and the perihelion distance `q` > 1.666 au following the Main Belt asteroid definition by the JPL Horizons small body database query tool (https://ssd.jpl.nasa.gov/tools/sbdb_query.html).  

The table returned by this query is called "unique" since it contains the IDs of unique Main Belt asteroids (although each object has many individual observations in LSST). The table should contain 296 unique objects.


```python
nobs_thrh = '2000'
min_a = '2.0'
max_a = '3.2'
min_q = '1.666'
```


```python
query = """
SELECT
    mpc.ssObjectId, mpc.mpcG, mpc.mpcH,
    mpc.q/(1-mpc.e) as a,
    sso.arc, sso.numObs,
    sso.g_H, sso.g_Herr, sso.g_G12, sso.g_G12err, sso.g_H_gG12_Cov,
    sso.r_H, sso.r_Herr, sso.r_G12, sso.r_G12err, sso.r_H_rG12_Cov,
    sso.i_H, sso.i_Herr, sso.i_G12, sso.i_G12err, sso.i_H_iG12_Cov,
    sso.z_H, sso.z_Herr, sso.z_G12, sso.z_G12err, sso.z_H_zG12_Cov
FROM
    dp03_catalogs_10yr.MPCORB as mpc
INNER JOIN dp03_catalogs_10yr.SSObject as sso
ON mpc.ssObjectId = sso.ssObjectId
WHERE sso.numObs > {} AND mpc.q/(1-mpc.e) > {} AND
mpc.q/(1-mpc.e) < {} AND mpc.q > {} ORDER by sso.ssObjectId
""".format(nobs_thrh, min_a, max_a, min_q)

uniqueObj = service.search(query).to_table()
uniqueObj
```

### 2.3 Query the DP0.3 DiaSource and SSSource catalogs

While there are unique solar system objects in the `SSObject` and `MPCORB` tables, these objects will be observed many times over the full LSST survey. Individual observations of each unique object are recorded in the `SSSource` and `DiaSource` tables. Below, we query these tables to obtain all of the individual observed time series data (we call `indivObs`) for the unique objects (`uniqueObj`) selected above. 


```python
query = """
SELECT
    dia.ssObjectId, dia.diaSourceId, dia.mag,
    dia.magErr, dia.band, dia.midPointMjdTai,
    sss.phaseAngle, sss.topocentricDist, sss.heliocentricDist
FROM
    dp03_catalogs_10yr.DiaSource as dia
INNER JOIN
    dp03_catalogs_10yr.SSSource as sss
ON
    dia.diaSourceId = sss.diaSourceId
WHERE
    dia.ssObjectId
    IN {}
ORDER by dia.ssObjectId
""".format(tuple(uniqueObj['ssObjectId']))

indivObs = service.search(query).to_table()
indivObs
```

Confirm that the number of unique objects in `indivObs` is identical to that of `uniqueObj`, as they should be.


```python
assert len(uniqueObj) == len(np.unique(indivObs['ssObjectId']))
```

## 3. Fit phase curves of unique main belt asteroids for three different models

### 3.1 Compute reduced magnitude

To plot the phase curve, we first must compute the reduced magnitude $H(\alpha)$ for each observation, and add it as a column to the `indivObs` table we produced of individual observations. The reduced magnitude $H(\alpha)$ is the normalized apparent magnitude of an asteroid as if it is observed at 1 au from both the Sun and the Earth as a function of phase angle $\alpha$, once accounting for the relative distances between the asteroid, and both Sun and Earth:

$$H(α) = m−5log_{10}(d_t\times\,d_h),$$

where $m$ is the apparent magnitude, and $d_t$ and $d_h$ are the topocentric and heliocentric distances of the object at the time of each observation. 


```python
thdist = indivObs['topocentricDist']*indivObs['heliocentricDist']
reduced_mag = indivObs['mag'] - 5.0*np.log10(thdist)

indivObs.add_column(reduced_mag, name='reducedMag')
```

### 3.2 Fit phase curve per unique object per filter 

The cell below now fits the phase curve for individual unique objects in each LSST filter using the three different fitting functions, `HG_model`, `HG1G2_model` and `HG12_model`. To ensure a good fit, the number of observations `nobs_ifilt` must be greater than the number of fit parameters (3). This cell takes ~3-6 min for 296 unique objects with the medium container size. The output x_fitted contains the parameters that are returned for each model fit.



```python
fitted_array = []

for iobj in uniqueObj['ssObjectId']:
    idx = indivObs['ssObjectId'] == iobj
    tmp = indivObs[idx]
    filts_tmp = np.unique(tmp['band'])
    for ifilt in filts_tmp:
        idx_filt = tmp['band'] == ifilt
        nobs_ifilt = len(tmp[idx_filt])

        if nobs_ifilt > 3:
            x_fitted = fitAllPhaseCurveModels(tmp['reducedMag'][idx_filt],
                                              tmp['magErr'][idx_filt],
                                              tmp['phaseAngle'][idx_filt])
            fitted_array.append([iobj, ifilt, x_fitted])

results = pd.DataFrame(fitted_array)
results.columns = ['ssObjectId', 'fname', 'fit_param']
```

Finally, convert the fit parameter dictionary to individual columns in a pandas dataframe to make it easy to read each parameter. 


```python
L = ['ssObjectId', 'fname']
results = results[L].join(pd.json_normalize(results.fit_param))
```

### 3.3 Plot the three different best-fit phase curves in each filter for a single object 

Now, we will plot example phase curves in all available filters (in DP0.3) $g$,$r$,$i$,$z$ for a single object referenced by its ssObjectId, which we call `sId`. (You can explore different objects by changing the `iObj` index to retrieve different sources). First the observations to be modeled are plotted, and then all three forms of phase curve model defined above. The plot demonstrates that the reduced magnitude and phase curve of the source are offset from each other in each filter, reflecting the variation in brightness of asteroids in different filters. Overall, it is clear that the 3 different fitted models all describe the observations well for well-sampled phase curves in DP0.3.

You can pick an integer number between 0 and `len(uniqueObj)-1` for `iObj` below to explore other objects.


```python
iObj = 100
sId = uniqueObj['ssObjectId'][iObj]
tmp = indivObs[indivObs['ssObjectId'] == sId]
phases = np.linspace(0, 90, 100)

for i, ifilt in enumerate(filts):
    idx = tmp['band'] == ifilt
    if i==0:
        labels = ['HG 2-parameter model',
                  'HG12 2-parameter model', 
                  'HG1G2 3-parameter model'
                 ]
    else:
        labels = [None, None, None]

    plt.errorbar(tmp['phaseAngle'][idx], tmp['reducedMag'][idx],
                 yerr=tmp['magErr'][idx], fmt='.',
                 color=filter_colors[ifilt], alpha=0.5, label=ifilt)

    HG_mag = HG.evaluate(np.deg2rad(phases),
                         results[(results.ssObjectId == sId) & (results.fname == ifilt)]['HG.H'].values,
                         results[(results.ssObjectId == sId) & (results.fname == ifilt)]['HG.G'].values)
    plt.plot(phases, HG_mag, color=filter_colors[ifilt],
             label=labels[0])

    HG12_mag = HG12.evaluate(np.deg2rad(phases),
                             results[(results.ssObjectId == sId) & (results.fname == ifilt)]['HG12.H'].values,
                             results[(results.ssObjectId == sId) & (results.fname == ifilt)]['HG12.G12'].values)
    plt.plot(phases, HG12_mag, color=filter_colors[ifilt], linestyle='--',
             label=labels[1])

    HG1G2_mag = HG1G2.evaluate(np.deg2rad(phases),
                               results[(results.ssObjectId == sId) & (results.fname == ifilt)]['HG1G2.H'].values,
                               results[(results.ssObjectId == sId) & (results.fname == ifilt)]['HG1G2.G1'].values,
                               results[(results.ssObjectId == sId) & (results.fname == ifilt)]['HG1G2.G2'].values)
    plt.plot(phases, HG1G2_mag, color=filter_colors[ifilt], linestyle='dotted',
             label=labels[2])

plt.xlim(tmp['phaseAngle'].min()-5, tmp['phaseAngle'].max()+5)
plt.ylim(tmp['reducedMag'].max()+0.5, tmp['reducedMag'].min()-0.5)
plt.xlabel('Phase Angle [deg]')
plt.ylabel('Reduced magnitude [mag]')
plt.legend(bbox_to_anchor=(1.05, 1.0), loc='upper left')
plt.title('ssObjectId = %d' % sId)
plt.show()
```

## 4. Compare manually-derived phase curve parameters to those provided in DP0.3

As mentioned in Section 2.2, the DP0.3 phase curve simulations were based on the `mpcH` and `mpcG` parameters stored in the `MPCORB` table using the `HG_model`. On the other hand, the simulated LSST observations of phase curves were fitted using the `HG12_model` and the resulting `H` and `G12` parameters are stored in the `SSObject` table. This Section compares those phase curve parameters provided in the DP0.3 tables to the manually-driven parameters using the `sbpy` package in this tutorial. 

### 4.1 Compare to the pipeline-provided phase curve parameters stored in the SSObject table

While modeling phase curves manually using these three fitting functions demonstrates the process, the `HG12_model` results (the parametrization that is more stable to limited observations across phase angles) will automatically be tabulated as a data product during the course of the survey in the `SSObject` table. This section will compare the manually derived parameters from the last section with those produced in LSST data products.

The figure below compares the manually-derived slope parameter `G12` for all the unique objects to the Rubin pipeline-provided values stored in the `SSObject` table in DP0.3. It is clear that overall the manual measurement recovers the DP0.3 value and uncertainty, which is expected because the `HG12` model was used to automatically fit the DP0.3 simulated data.


```python
fig = plt.figure(figsize=(10, 7))
gs = fig.add_gridspec(2, 2, wspace=0, hspace=0)
axs = gs.subplots(sharex=True, sharey=True)
axs = axs.ravel()

one2one = np.arange(0.01, 1, .01)
filts = ['g', 'r', 'i', 'z']
for i, ifilt in enumerate(filts):

    axs[i].errorbar(results[results.fname == ifilt]['HG12.G12'],
                    uniqueObj[ifilt+'_G12'],
                    xerr=results[results.fname == ifilt]['HG12.G12_err'],
                    yerr=uniqueObj[ifilt+'_G12err'], fmt='.', alpha=0.5,
                    label='G12 HG12 model')

    axs[i].plot(one2one, one2one, '--', label='1:1 correspondence')
    axs[i].text(0.75, 0.1, ifilt+'-band')

fig.supxlabel('Slope parameter G [HG12_model]')
fig.supylabel('Slope parameter G [SSObject Table]')
axs[0].legend(loc=2)
plt.show()
```

The below figure compares the manually-derived absolute magnitude `H` for all the unique objects to the Rubin pipeline-provided values stored in the `SSObject` table in DP0.3. Like the `G12` parameter, it is clear that overall the manual measurement recovers the DP0.3 value and uncertainty, which is expected because the `HG12` model was used to automatically fit the DP0.3 simulated data.


```python
fig = plt.figure(figsize=(10, 7))
gs = fig.add_gridspec(2, 2, wspace=0, hspace=0)
axs = gs.subplots(sharex=True, sharey=True)
axs = axs.ravel()

one2one = np.arange(11, 22, 1)
for i, ifilt in enumerate(filts):

    axs[i].errorbar(results[results.fname == ifilt]['HG12.H'],
                    uniqueObj[ifilt+'_H'],
                    xerr=results[results.fname == ifilt]['HG12.H_err'],
                    yerr=uniqueObj[ifilt+'_Herr'], fmt='.', alpha=0.5,
                    label='H HG12 model')

    axs[i].plot(one2one, one2one, '--', label='1:1 correspondence')
    axs[i].text(18.5, 12, ifilt+'-band')

fig.supxlabel('Absolute magnitude H [HG12_model]')
fig.supylabel('Absolute magnitude H [SSObject Table]')
axs[0].legend(loc=2)
plt.show()
```

### 4.2 Compare to the input phase curve parameters stored in the MPCORB table

This section compares the input phase curve parameters, `mpcH` and `mpcG`, that were used to simulate asteroids in DP0.3 with those derived using the `HG_model` in this tutorial to see how well the input parameters are recovered in the simulated LSST results at the end of the 10 year survey.  The left panel shows the difference of $\sim$0.02 between the input slope `G` and the output slope `G` guided by the red solid lines in all four filters. As shown in the right panel, the distributions of out-in absolute magnitude `H` are more complicated. Recall that `mpcH` is reported in $V$ band; the conversion from Rubin filters to $V$ is summarized in <a href="https://dp0-3.lsst.io/data-products-dp0-3/data-simulation-dp0-3.html#synthetic-object-populations">Table 1 of the DP0.3 documentation</a>. The filter conversion can not fully explain the offsets seen in the out-in distributions (the table of filter conversions between V-band and LSST at the link above are never more than 0.4, but the right-hand panel shows g-bad with an offset of >0.4).   


```python
fig = plt.figure(figsize=(10, 4))
gs = fig.add_gridspec(1, 2, wspace=0)
axs = gs.subplots(sharey=True)
axs = axs.ravel()

one2one = np.arange(0.01, 1, .01)
for i, ifilt in enumerate(filts):

    h = axs[0].hist(results[results.fname == ifilt]['HG.G']
                    - uniqueObj['mpcG'], bins=50, density=True,
                    histtype='step', color=filter_colors[ifilt], label=ifilt)

    h = axs[1].hist(results[results.fname == ifilt]['HG.H']
                    - uniqueObj['mpcH'], bins=50, density=True,
                    histtype='step', color=filter_colors[ifilt])


axs[0].set_xlabel('Out - In (Slope parameter G)')
axs[0].set_ylabel('N')
axs[0].plot([0, 0], [0, 80], 'k--',label='zero bias')
axs[0].plot([0.02, 0.02], [0, 80], 'k',label='detected bias')
axs[0].set_ylim(0, 70)
axs[0].legend(loc=1)
axs[1].set_xlabel('Out - In (Absolute magnitude H)')
plt.show()
```

## 5. An incomplete list of outstanding questions about DP0.3 phase curves 
This DP0.3 release revealed some unknown features that can be resolved in the future as people use the simulation. Some things that warrant further exploration:

- A small bias (roughly 0.02 in all filters) was identified in the `G` parameter of `HG_model` (average measured value - intrinsic value of `G`).

- Offsets between the intrinsic absolute magnitude in $V$ band and recovered absolute magnitude in the LSST filters are larger than listed in the filter-conversion table referenced above.

- **Update on Jan, 2024**: The current DP0.3 catalogs reported PSF magnitudes without taking the effect of object trailing into account. When correcting for this effect, the two biases seen above disappear. It will be fixed in subsequent releases.

## 6. Excercises for the learner

1. Compare the 3 fits for objects with less phase coverage (e.g., Jupiter Trojans).
2. Fit phase curves for TNOs with a linear function.
3. Apply the filter conversion in each Rubin filter and revisit the second plot in Section 4.2.

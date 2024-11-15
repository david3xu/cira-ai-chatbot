<img align="left" src = https://project.lsst.org/sites/default/files/Rubin-O-Logo_0.png width=250 style="padding: 10px"> 
<br>
<b>Orbital Properties of Near-Earth Objects (NEOs)</b> <br>
Contact author(s): Sarah Greenstreet <br>
Last verified to run: 2024-05-01 <br>
LSST Science Pipelines version: Weekly 2024_16 <br>
Container Size: medium <br>
Targeted learning level: beginner <br>

**Description:** An introduction to near-Earth objects (NEOs) in the DP0.3 dataset, including illustrations of the four NEOs sub-populations: Amors, Apollos, Atens, and Atiras.

**Skills:** Use TAP queries to retrieve Solar System objects. Plot properties and orbits of near-Earth objects.

**LSST Data Products:** TAP DP0.3 MPCORB (10-year) and SSObject tables.

**Packages:** lsst.rsp.get_tap_service

**Credit:**
Originally developed by Sarah Greenstreet and the Rubin Community Science Team in the context of the Rubin DP0.

**Get Support:**
Find DP0-related documentation and resources at <a href="https://dp0.lsst.io">dp0.lsst.io</a>. Questions are welcome as new topics in the <a href="https://community.lsst.org/c/support/dp0">Support - Data Preview 0 Category</a> of the Rubin Community Forum. Rubin staff will respond to all questions posted there.

## 1. Introduction

This tutorial demonstrates how to use TAP to query the MPCORB and SSObject tables. The tables are queried simultaneously and joined on their SSObjectId. The properties of near-Earth objects (NEOs; perihelia $q$<1.3 au) from the DP0.3 catalogs are examined. The NEOs in this sample are restricted to those with semimajor axes $a$<4.0 au, and eccentricities $e$<1.0. The orbital properties of NEOs are examined, including plotting the planet-crossing regions and boundaries that define the four NEO sub-populations: Amors, Apollos, Atens, and Atiras.

### 1.1 NEO Dynamical Classes

Near-Earth objects (NEOs) are traditionally divided into four dynamical sub-populations based on their orbital parameters compared to the orbit of the Earth. The Earth's orbit is nearly circular with a semimajor axis $a$ = 1.0 au and eccentricity $e$ = 0.017. This gives the Earth a perihelion distance $q$ = 0.983 au and an aphelion distance of $Q$ = 1.017 au. The four NEO sub-populations (Amors, Apollos, Atens, and Atiras) are divided using these orbital parameters of the Earth as follows:

**Amors** have orbits exterior to Earth's orbit with perihelia larger than Earth's aphelion and less than 1.3 au (1.017 au < $q$ < 1.3 au). Amors are always farther from the Sun than Earth.

**Apollos** are on Earth-crossing orbits with perihelia smaller than Earth's aphelion ($q$ < 1.017 au) and semimajor axes $a$ > 1.0 au. Apollos are Earth-crossers with semimajor axes larger than Earth's orbit.

**Atens** are on Earth-crossing orbits with aphelia larger than Earth's perihelion ($Q$ > 0.983 au) and semimajor axes $a$ < 1.0 au. Atens are Earth-crossers with semimajor axes smaller than Earth's orbit.

**Atiras** have orbits interior to Earth's orbit with aphelia smaller than Earth's perihelion ($Q$ < 0.983 au). Atiras are always closer to the Sun than Earth.

The schematic diagram shown below illustrates examples of Amor, Apollos, Aten, and Atira orbits compared to Earth's orbit.

![NEO_orbital_schematic.png](DP03_05_Near-Earth_Objects_files/9e7ac462-1712-46dd-a398-7b92eb7f7a0d.png)

This notebook provides examples of plotting the boundaries for each NEO sub-population in semimajor axis $a$ versus eccentricity $e$ and how to divide the NEOs queried from the DP0.3 tables into these four sub-populations. 

### 1.2 Package Imports

The `matplotlib` and `numpy` libraries are widely used Python libraries for plotting and scientific computing. We will use these packages below, including the matplotlib.pyplot plotting sublibrary.

We also use the `lsst.rsp` package to access the TAP service and query the DP0 catalogs.


```python
# general python packages
import numpy as np
import matplotlib.pyplot as plt
import pandas as pd

# LSST package for TAP queries
from lsst.rsp import get_tap_service
```

### 1.3 Define Functions and Parameters

#### 1.3.1 Define functions for computing orbital parameters not included in the MPCORB table

Define a function to convert a given perihelion distance ($q$) and eccentricity ($e$) to an orbital semimajor axis ($a$). Their relationship is defined by $q=a*(1−e)$.


```python
def calc_semimajor_axis(q, e):
    """
    Given a perihelion distance and orbital eccentricity,
    calculate the semi-major axis of the orbit.

    Parameters
    ----------
    q: ndarray
        Distance at perihelion, in au.
    e: ndarray
        Orbital eccentricity.

    Returns
    -------
    a: ndarray
        Semi-major axis of the orbit, in au.
        q = a(1-e), so a = q/(1-e)
    """

    return q / (1.0 - e)
```

Define a function to convert a given perihelion distance ($q$) and eccentricity ($e$) to an aphelion distance ($Q$). Their relationships are defined by: $Q=q*(1+e)/(1-e)$.


```python
def calc_aphelion(q, e):
    """
    Given a perihelion distance and orbital eccentricity,
    calculate the semi-major axis of the orbit.

    Parameters
    ----------
    q: ndarray
        Distance at perihelion, in au.
    e: ndarray
        Orbital eccentricity.

    Returns
    -------
    Q: ndarray
        Distance at aphelion, in au.
        Q = q*(1+e)/(1-e)
    """

    return q * (1.0 + e) / (1.0 - e)
```

#### 1.3.2 Define functions to return arrays needed for plotting planet-crossing curves on an ($a$, $e$) plot

Define a function to return an array with ($a$, $e$) values needed to plot a curve showing the aphelion at a planet's perihelion.


```python
def get_Q_at_planets_q_curve_values(q_planet):

    a_Q = np.arange(0.001, q_planet, 0.001)
    e_Q = (q_planet / a_Q) - 1.0

    return (a_Q, e_Q)
```

Define a function to return an array with ($a$, $e$) values needed to plot a curve showing the perihelion at a planet's aphelion.


```python
def get_q_at_planets_Q_curve_values(Q_planet):

    a_q = np.arange(Q_planet, 4.0, 0.001)
    e_q = (1.0 - (Q_planet / a_q))

    return (a_q, e_q)
```

Define the perihelia and aphelia for the terrestrial planets and the perihelion boundary for NEOs.


```python
q_Earth = 0.983
Q_Earth = 1.017

q_Mercury = 0.307
Q_Mercury = 0.467

q_Venus = 0.718
Q_Venus = 0.728

q_Mars = 1.381
Q_Mars = 1.666

q_NEOs = 1.3
```

Set some plotting defaults to make plots look nice.


```python
plt.style.use('tableau-colorblind10')
%matplotlib inline

params = {'axes.labelsize': 15,
          'font.size': 15,
          'legend.fontsize': 10,
          'xtick.major.width': 2,
          'xtick.minor.width': 1,
          'xtick.major.size': 6,
          'xtick.minor.size': 3,
          'xtick.direction': 'in',
          'xtick.top': True,
          'lines.linewidth': 2,
          'axes.linewidth': 2,
          'axes.labelweight': 1,
          'axes.titleweight': 1,
          'ytick.major.width': 1,
          'ytick.minor.width': 2,
          'ytick.major.size': 6,
          'ytick.minor.size': 3,
          'ytick.direction': 'in',
          'ytick.right': True,
          'figure.figsize': [6, 6],
          'figure.facecolor': 'White'
          }
plt.rcParams.update(params)
```

## 2. Orbital Parameters of Near-Earth Objects (NEOs)

### 2.1 Query the DP0.3 catalogs to create a table of NEOs and their orbital parameters

Get an instance of the Rubin TAP service client, and assert that it exists.


```python
service = get_tap_service("ssotap")
assert service is not None
```

Query the DP0.3 catalogs, joining the MPCORB and SSObject tables on their ssObjectId. Limit the query to select sources in the MPCORB table with perihelia $q$ < 1.3 au, eccentricities $e$ < 1, and semimajor axes $a$ < 4 au to get only near-Earth objects, excluding interstellar objects with $e$ > 1 or $a$ < 0.

Define the table returned by this query as "uniqueNEOs" since it contains the IDs of unique solar system objects.


```python
q_select = '1.3'
e_select = '1.0'
a_select = '4.0'

query = """
        SELECT
            mpc.ssObjectId, mpc.mpcDesignation,
            mpc.e, mpc.q, mpc.incl
        FROM
            dp03_catalogs_10yr.MPCORB as mpc
        INNER JOIN dp03_catalogs_10yr.SSObject as sso
        ON mpc.ssObjectId = sso.ssObjectId
        WHERE mpc.q < {} AND mpc.e < {}
        AND mpc.q/(1.0-mpc.e) < {} ORDER by mpc.mpcDesignation
        """.format(q_select, e_select, a_select)

uniqueNEOs = service.search(query).to_table().to_pandas()
```

Calculate the semimajor axis $a$ of each object's orbit, using the function defined above, and add it as a column to the `uniqueNEOs` table.


```python
a = calc_semimajor_axis(uniqueNEOs['q'], uniqueNEOs['e'])
uniqueNEOs['a'] = a
```

Then use the function defined above to calculate the aphelion distance $Q$ of each object's orbit and add it as a column to the `uniqueNEOs` table.


```python
Q = calc_aphelion(uniqueNEOs['q'], uniqueNEOs['e'])
uniqueNEOs['Q'] = Q
```

Print the `uniqueNEOs` table.


```python
uniqueNEOs
```

### 2.2 Create semimajor axis $a$ versus eccentricity $e$ plots of the four dynamical sub-populations of NEOs

Plot the semimajor axis versus eccentricity of all NEOs in the `uniqueNEOs` table.


```python
fig, ax = plt.subplots()

plt.xlim([0., 4.])
plt.ylim([0., 1.])
ax.scatter(uniqueNEOs.a, uniqueNEOs.e, s=0.1)
ax.set_xlabel('semimajor axis (au)')
ax.set_ylabel('eccentricity')
ax.minorticks_on()

plt.show()
```

In order to show the boundaries for the four NEO sub-populations (Amors, Apollos, Atens, and Atiras), arrays of ($a$, $e$) values along the Earth's perihelion and aphelion distances are needed along with those for the $q$ < 1.3 au NEO boundary.


```python
a_Q_Earth, e_Q_Earth = get_Q_at_planets_q_curve_values(q_Earth)

a_q_Earth, e_q_Earth = get_q_at_planets_Q_curve_values(Q_Earth)

a_q_NEO, e_q_NEO = get_q_at_planets_Q_curve_values(q_NEOs)
```

Plot the Earth-crossing curves as a function of $a$ and $e$ and label the NEO class regions.


```python
fig, ax = plt.subplots()
plt.xlim([0., 4.])
plt.ylim([0., 1.])
ax.axvline(x=1.0, color="blue")
ax.plot(a_Q_Earth, e_Q_Earth, "blue")
ax.plot(a_q_Earth, e_q_Earth, "blue")
ax.plot(a_q_NEO, e_q_NEO, "black", linewidth=3)
ax.annotate('Amors', xy=(2.25, 0.5), xytext=(2.25, 0.5),
            rotation=30.0, weight='bold')
ax.annotate('Apollos', xy=(1.45, 0.75), xytext=(1.45, 0.75),
            weight='bold')
ax.annotate('Atens', xy=(0.7, 0.6), xytext=(0.7, 0.6),
            rotation=270.0, weight='bold')
ax.annotate('Atiras', xy=(0.3, 0.5), xytext=(0.3, 0.5),
            rotation=280.0, weight='bold')
ax.minorticks_on()
plt.xlabel("semimajor axis (au)")
plt.ylabel("eccentricity")
plt.title("NEO Class Boundaries")
plt.show()
```

To better understand the above ($a$, $e$) plot, remember that the Sun is at the origin ($a$, $e$) = (0, 0) and the Earth has $a$ = 1.0 au and $e$ = 0.017, so it sits on the x-axis where the three blue curves converge. The space between the two outermost blue curves is Earth-crossing space where the Earth-crossing NEOs (Apollos and Atens) sit. A semimajor axis $a$ = 1.0 au divides the Earth-crossing NEOs into Apollos ($a$ > 1.0 au) and Atens ($a$ < 1.0 au). The black curve marks the $q$ < 1.3 au boundary for NEOs by definition. Amors sit between the $q$ < 1.3 au curve and the outer edge of Earth-crossing space (i.e., perihelia > Earth's aphelion = $q$ > 1.017 au); Amors thus always remain farther from the Sun than the Earth. Atiras are opposite to the Amors in that they always remain closer to the Sun than the Earth and live interior to Earth-crossing space; Atiras thus have aphelia < Earth's perihelion = $Q$ < 0.983 au.

Next, in order to plot the four NEO sub-populations on an ($a$, $e$) plot like the one above, first define the parameters of each sub-population needed to extract them individually from the `uniqueNEOs` table.

To ensure that we don't miss any NEOs in our table by our defined parameters, total the number of objects in each extracted sub-population and assert that it equals the number of objects in the `uniqueNEOs` table.


```python
Amor_params = (uniqueNEOs.q < q_NEOs) & (uniqueNEOs.q > Q_Earth)

Apollo_params = (uniqueNEOs.q < Q_Earth) & (uniqueNEOs.a > 1.0)

Aten_params = (uniqueNEOs.Q > q_Earth) & (uniqueNEOs.a < 1.0)

Atira_params = (uniqueNEOs.Q < q_Earth)

total_NEOs = len(uniqueNEOs[Amor_params]
                 + uniqueNEOs[Apollo_params]
                 + uniqueNEOs[Aten_params]
                 + uniqueNEOs[Atira_params])

assert total_NEOs == len(uniqueNEOs)
```

Plot the semimajor axis versus eccentricity of all NEOs in the `uniqueNEOs` table divided into the four dynamical sub-populations, overplot the boundaries for each sub-population, and label each NEO class region.


```python
fig, ax = plt.subplots()
plt.xlim([0., 4.])
plt.ylim([0., 1.])
ax.scatter(uniqueNEOs[Amor_params].a, uniqueNEOs[Amor_params].e,
           s=0.1, color='red')
ax.scatter(uniqueNEOs[Apollo_params].a, uniqueNEOs[Apollo_params].e,
           s=0.1, color='green')
ax.scatter(uniqueNEOs[Aten_params].a, uniqueNEOs[Aten_params].e,
           s=0.1, color='orange')
ax.scatter(uniqueNEOs[Atira_params].a, uniqueNEOs[Atira_params].e,
           s=0.25, color='purple')
ax.plot(a_Q_Earth, e_Q_Earth, "blue")
ax.plot(a_q_Earth, e_q_Earth, "blue")
ax.axvline(x=1.0, color="blue")
ax.plot(a_q_NEO, e_q_NEO, "black", linewidth=5)
ax.annotate('Amors', xy=(2.25, 0.5), xytext=(2.25, 0.5),
            rotation=30.0, weight='bold')
ax.annotate('Apollos', xy=(1.45, 0.75), xytext=(1.45, 0.75),
            weight='bold')
ax.annotate('Atens', xy=(0.7, 0.6), xytext=(0.7, 0.6),
            rotation=270.0, weight='bold')
ax.annotate('Atiras', xy=(0.3, 0.5), xytext=(0.3, 0.5),
            rotation=280.0, weight='bold')
ax.minorticks_on()
plt.xlabel("semimajor axis (au)")
plt.ylabel("eccentricity")
plt.title("NEOs in DP0.3")
plt.show()
```

To better see the density of points in the above ($a$, $e$) scatter plot, next use a 2-D histogram plot where the bins are shown as hexagons and the color represents the number of data points within each bin, from purple/blue as the fewest to red regions containing the most objects. Again, overplot the NEO class boundaries with labels.


```python
fig, ax = plt.subplots(figsize=(8, 6))

plt.xlim([0., 4.])
plt.ylim([0., 1.])

ax.hexbin(uniqueNEOs.a, uniqueNEOs.e,
          gridsize=(int(4./0.02), 50),
          cmap='Spectral_r', bins='log',
          extent=(0, 4., 0, 1))
ax.plot(a_Q_Earth, e_Q_Earth, "blue")
ax.plot(a_q_Earth, e_q_Earth, "blue")
ax.axvline(x=1.0, color="blue")
ax.plot(a_q_NEO, e_q_NEO, "black", linewidth=5)
ax.annotate('Amors', xy=(2.25, 0.5), xytext=(2.25, 0.5),
            rotation=30.0, weight='bold')
ax.annotate('Apollos', xy=(1.45, 0.75), xytext=(1.45, 0.75),
            weight='bold')
ax.annotate('Atens', xy=(0.7, 0.6), xytext=(0.7, 0.6),
            rotation=270.0, weight='bold')
ax.annotate('Atiras', xy=(0.3, 0.5), xytext=(0.3, 0.5),
            rotation=280.0, weight='bold')
ax.set_ylabel('eccentricity')
ax.set_xlabel('semimajor axis (au)')
ax.minorticks_on()

plt.show()
```

In the above plot, it is clear that in addition to other areas of overdensity, the Amors have an overdensity of points near 2.1 au < $a$ < 2.4 au and 0.4 < $e$ < 0.5 that is difficult to see in the scatter plot alone.

The above density plot prompts the question of what fraction of NEOs are in each of the sub-populations, which can easily be calculated.


```python
perc_Amors = len(uniqueNEOs[Amor_params]) / total_NEOs * 100.
perc_Apollos = len(uniqueNEOs[Apollo_params]) / total_NEOs * 100.
perc_Atens = len(uniqueNEOs[Aten_params]) / total_NEOs * 100.
perc_Atiras = len(uniqueNEOs[Atira_params]) / total_NEOs * 100.

print("Percentage of NEOs that are Amors: ", "%4.1f" % (perc_Amors), "%")
print("Percentage of NEOs that are Apollos: ", "%4.1f" % (perc_Apollos), "%")
print("Percentage of NEOs that are Atens: ", "%4.1f" % (perc_Atens), "%")
print("Percentage of NEOs that are Atiras: ", "%4.1f" % (perc_Atiras), "%")
```

### 2.3 Create an ($a$, $e$) plot the terrestrial-planet-crossing regions and compare the the four NEO sub-populations

In addition to plotting the Earth-crossing curves on an ($a$, $e$) plot, the planet-crossing curves for all the terrestrial planets can also be plotted.

First, as with the Earth-crossing curves above, arrays of ($a$, $e$) values along the Mercury, Venus, and Mars' perihelion and aphelion distances are needed.


```python
a_Q_Mercury, e_Q_Mercury = get_Q_at_planets_q_curve_values(q_Mercury)
a_q_Mercury, e_q_Mercury = get_q_at_planets_Q_curve_values(Q_Mercury)

a_Q_Venus, e_Q_Venus = get_Q_at_planets_q_curve_values(q_Venus)
a_q_Venus, e_q_Venus = get_q_at_planets_Q_curve_values(Q_Venus)

a_Q_Mars, e_Q_Mars = get_Q_at_planets_q_curve_values(q_Mars)
a_q_Mars, e_q_Mars = get_q_at_planets_Q_curve_values(Q_Mars)
```

Plot the terrestrial-planet-crossing curves as a function of $a$ and $e$.


```python
fig, ax = plt.subplots()
plt.xlim([0., 4.])
plt.ylim([0., 1.])
ax.plot(a_Q_Mercury, e_Q_Mercury, "green", label="Mercury-crossing")
ax.plot(a_q_Mercury, e_q_Mercury, "green")
ax.plot(a_Q_Venus, e_Q_Venus, "orange", label="Venus-crossing")
ax.plot(a_q_Venus, e_q_Venus, "orange")
ax.plot(a_Q_Earth, e_Q_Earth, "blue", label="Earth-crossing")
ax.plot(a_q_Earth, e_q_Earth, "blue")
ax.plot(a_Q_Mars, e_Q_Mars, "red", label="Mars-crossing")
ax.plot(a_q_Mars, e_q_Mars, "red")
ax.minorticks_on()
ax.legend()
plt.xlabel("semimajor axis (au)")
plt.ylabel("eccentricity")
plt.title("Terrestrial-Planet-Crossing Regions for NEOs")
plt.show()
```

Each of the four NEO sub-populations can be plotted in addition to the terrestrial-planet-crossing curves in order to see which of the four inner planetary orbits each NEO class crosses.


```python
fig, ax = plt.subplots()
plt.xlim([0., 4.])
plt.ylim([0., 1.])
ax.scatter(uniqueNEOs[Amor_params].a, uniqueNEOs[Amor_params].e,
           s=0.1, color='red')
ax.scatter(uniqueNEOs[Apollo_params].a, uniqueNEOs[Apollo_params].e,
           s=0.1, color='green')
ax.scatter(uniqueNEOs[Aten_params].a, uniqueNEOs[Aten_params].e,
           s=0.1, color='orange')
ax.scatter(uniqueNEOs[Atira_params].a, uniqueNEOs[Atira_params].e,
           s=0.25, color='purple')
ax.plot(a_Q_Mercury, e_Q_Mercury, "green", label="Mercury-crossing")
ax.plot(a_q_Mercury, e_q_Mercury, "green")
ax.plot(a_Q_Venus, e_Q_Venus, "orange", label="Venus-crossing")
ax.plot(a_q_Venus, e_q_Venus, "orange")
ax.plot(a_Q_Earth, e_Q_Earth, "blue", label="Earth-crossing")
ax.plot(a_q_Earth, e_q_Earth, "blue")
ax.plot(a_Q_Mars, e_Q_Mars, "red", label="Mars-crossing")
ax.plot(a_q_Mars, e_q_Mars, "red")
ax.plot(a_q_NEO, e_q_NEO, "black", linewidth=5)
ax.annotate('Amors', xy=(2.25, 0.5), xytext=(2.25, 0.5),
            rotation=30.0, weight='bold')
ax.annotate('Apollos', xy=(1.45, 0.75), xytext=(1.45, 0.75),
            weight='bold')
ax.annotate('Atens', xy=(0.7, 0.6), xytext=(0.7, 0.6),
            rotation=270.0, weight='bold')
ax.annotate('Atiras', xy=(0.3, 0.5), xytext=(0.3, 0.5),
            rotation=280.0, weight='bold')
ax.minorticks_on()
ax.legend()
plt.xlabel("semimajor axis (au)")
plt.ylabel("eccentricity")
plt.title("Terrestrial-Planet-Crossing NEOs")
plt.show()
```

Next, define the parameters of each planet-crossing regions for each of the terrestrial planets in order to extract the planet-crossing NEO populations individually from the `uniqueNEOs` table.


```python
Earth_crossing = (uniqueNEOs.q < Q_Earth) & (uniqueNEOs.Q > q_Earth)

Mercury_crossing = (uniqueNEOs.q < Q_Mercury) & (uniqueNEOs.Q > q_Mercury)

Venus_crossing = (uniqueNEOs.q < Q_Venus) & (uniqueNEOs.Q > q_Venus)

Mars_crossing = (uniqueNEOs.q < Q_Mars) & (uniqueNEOs.Q > q_Mars)
```

Make a 4-panel density plot of the planet-crossing NEO populations in the DP0.3 catalogs as a function of $a$ and $e$, with one panel for each of the four terrestrial planets; each density plot is individually normalized where the color represents the number of data points within each bin, from purple/blue as the fewest objects to red regions containing the most objects.


```python
fig, axs = plt.subplots(2, 2)
fig.suptitle('Planet-Crossing NEOs in DP0.3')

axs[0, 0].set_xlim([0., 4.])
axs[0, 0].set_ylim([0., 1.])
axs[0, 0].hexbin(uniqueNEOs[Mercury_crossing].a,
                 uniqueNEOs[Mercury_crossing].e,
                 gridsize=(int(4./0.02), 50),
                 cmap='Spectral_r', bins='log',
                 extent=(0, 4., 0, 1))
axs[0, 0].plot(a_Q_Mercury, e_Q_Mercury, "green")
axs[0, 0].plot(a_q_Mercury, e_q_Mercury, "green")
axs[0, 0].plot(a_q_NEO, e_q_NEO, "black", linewidth=2)
axs[0, 0].set_title('Mercury-crossing')
axs[0, 0].minorticks_on()

axs[0, 1].set_xlim([0., 4.])
axs[0, 1].set_ylim([0., 1.])
axs[0, 1].hexbin(uniqueNEOs[Venus_crossing].a,
                 uniqueNEOs[Venus_crossing].e,
                 gridsize=(int(4./0.02), 50),
                 cmap='Spectral_r', bins='log',
                 extent=(0, 4., 0, 1))
axs[0, 1].plot(a_Q_Venus, e_Q_Venus, "orange")
axs[0, 1].plot(a_q_Venus, e_q_Venus, "orange")
axs[0, 1].plot(a_q_NEO, e_q_NEO, "black", linewidth=2)
axs[0, 1].set_title('Venus-crossing')
axs[0, 1].minorticks_on()

axs[1, 0].set_xlim([0., 4.])
axs[1, 0].set_ylim([0., 1.])
axs[1, 0].hexbin(uniqueNEOs[Earth_crossing].a,
                 uniqueNEOs[Earth_crossing].e,
                 gridsize=(int(4./0.02), 50),
                 cmap='Spectral_r', bins='log',
                 extent=(0, 4., 0, 1))
axs[1, 0].plot(a_Q_Earth, e_Q_Earth, "blue")
axs[1, 0].plot(a_q_Earth, e_q_Earth, "blue")
axs[1, 0].plot(a_q_NEO, e_q_NEO, "black", linewidth=2)
axs[1, 0].set_title('Earth-crossing')
axs[1, 0].minorticks_on()
axs[1, 0].xaxis.set_tick_params(labelbottom=False)

axs[1, 1].set_xlim([0., 4.])
axs[1, 1].set_ylim([0., 1.])
axs[1, 1].hexbin(uniqueNEOs[Mars_crossing].a,
                 uniqueNEOs[Mars_crossing].e,
                 gridsize=(int(4./0.02), 50),
                 cmap='Spectral_r', bins='log',
                 extent=(0, 4., 0, 1))
axs[1, 1].plot(a_Q_Mars, e_Q_Mars, "red")
axs[1, 1].plot(a_q_Mars, e_q_Mars, "red")
axs[1, 1].plot(a_q_NEO, e_q_NEO, "black", linewidth=2)
axs[1, 1].set_title('Mars-crossing')
axs[1, 1].minorticks_on()
axs[1, 1].xaxis.set_tick_params(labelbottom=False)

for ax in axs.flat:
    ax.set(xlabel='semimajor axis (au)', ylabel='eccentricity')
for ax in axs.flat:
    ax.label_outer()
plt.show()
```

The percentage of NEOs that are Earth-crossing or Mars-crossing or Venus-crossing or Mercury-crossing (as shown above) can also easily be calculated.


```python
perc_Earth_crossing_NEOs = (
    len(uniqueNEOs[Earth_crossing]) / total_NEOs * 100.)
perc_Venus_crossing_NEOs = (
    len(uniqueNEOs[Venus_crossing]) / total_NEOs * 100.)
perc_Mercury_crossing_NEOs = (
    len(uniqueNEOs[Mercury_crossing]) / total_NEOs * 100.)
perc_Mars_crossing_NEOs = (
    len(uniqueNEOs[Mars_crossing]) / total_NEOs * 100.)

print("Percentage of NEOs that are Mercury-crossing: ", "%4.1f" %
      (perc_Mercury_crossing_NEOs), "%")
print("Percentage of NEOs that are Venus-crossing: ", "%4.1f" %
      (perc_Venus_crossing_NEOs), "%")
print("Percentage of NEOs that are Earth-crossing: ", "%4.1f" %
      (perc_Earth_crossing_NEOs), "%")
print("Percentage of NEOs that are Mars-crossing: ", "%4.1f" %
      (perc_Mars_crossing_NEOs), "%")
```

Note that the Mars-crossing NEOs include all of the Amors, nearly all of the Apollos, and some of the Atens, covering the vast majority of the NEO population density at >90%. The Earth-crossing NEOs, Apollos and Atens, constitute 61.8% of the NEO population, consistent with their NEO percentages calculated above (Apollos = 55.3% of NEOs and Atens = 6.5% of NEOs). Venus- and Mercury-crossing NEOs include respectively fewer Apollos, Atens, and Atiras, where the Atens + Atiras are only 6.6% of the NEO population, resulting in respectively smaller percentages of the NEOs crossing the orbits of these planets.

It is also possible to extract the planet-crossing NEOs for multiple (or all) planets together as shown below.


```python
V_AND_E_crossing = (
    (uniqueNEOs.q < Q_Venus) & (uniqueNEOs.Q > q_Earth))

Me_AND_V_AND_E_AND_Ma_crossing = (
    (uniqueNEOs.q < Q_Mercury) & (uniqueNEOs.Q > q_Mars))
```

The percentage of NEOs that are both Venus- and Earth-crossing can also easily be calculated, as can the percentage of NEOs that cross the orbits of Mercury, Venus, Earth, and Mars.


```python
perc_V_AND_E_crossing_NEOs = (
    len(uniqueNEOs[V_AND_E_crossing]) / total_NEOs * 100.)
perc_Me_AND_V_AND_E_AND_Ma_crossing_NEOs = (
    len(uniqueNEOs[Me_AND_V_AND_E_AND_Ma_crossing]) / total_NEOs * 100.)

print("Percentage of NEOs that are both \
Venus- and Earth-crossing: ", "%4.1f" %
      (perc_V_AND_E_crossing_NEOs), "%")
print("Percentage of NEOs that are \
Mercury- and Venus- and Earth- and Mars-crossing: ", "%4.1f" %
      (perc_Me_AND_V_AND_E_AND_Ma_crossing_NEOs), "%")
```

NEOs on orbits that cross both Venus' and Earth's orbit can be additionally be plotted, as an example.


```python
fig, ax = plt.subplots()
plt.xlim([0., 4.])
plt.ylim([0., 1.])
ax.scatter(uniqueNEOs[V_AND_E_crossing].a,
           uniqueNEOs[V_AND_E_crossing].e,
           s=0.1)
ax.plot(a_Q_Mercury, e_Q_Mercury, "green", label="Mercury-crossing")
ax.plot(a_q_Mercury, e_q_Mercury, "green")
ax.plot(a_Q_Venus, e_Q_Venus, "orange", label="Venus-crossing")
ax.plot(a_q_Venus, e_q_Venus, "orange")
ax.plot(a_Q_Earth, e_Q_Earth, "blue", label="Earth-crossing")
ax.plot(a_q_Earth, e_q_Earth, "blue")
ax.plot(a_Q_Mars, e_Q_Mars, "red", label="Mars-crossing")
ax.plot(a_q_Mars, e_q_Mars, "red")
ax.minorticks_on()
ax.legend()
plt.xlabel("semimajor axis (au)")
plt.ylabel("eccentricity")
plt.title("Venus- and Earth-Crossing NEOs")
plt.show()
```

### 2.4 Explore the inclination distribution of NEOs in DP0.3

First add a plot of the semimajor axis $a$ versus inclination $i$ of all NEOs in the `uniqueNEOs` table to the ($a$, $e$) plot.


```python
fig, (ax1, ax2) = plt.subplots(2, 1)

ax1.set_xlim([0., 4.])
ax1.set_ylim([0., 90.])
ax1.scatter(uniqueNEOs.a, uniqueNEOs.incl, s=0.1)
ax1.set_ylabel('inclination (deg)')
ax1.set_title('NEOs in DP0.3')
ax1.minorticks_on()

ax2.set_xlim([0., 4.])
ax2.set_ylim([0., 1.])
ax2.scatter(uniqueNEOs.a, uniqueNEOs.e, s=0.1)
ax2.set_xlabel('semimajor axis (au)')
ax2.set_ylabel('eccentricity')
ax2.minorticks_on()

plt.show()
```

To better see the density of points in the above ($a$, $e$) and ($a$, $i$) scatter plot, use a 2-panel 2-D histogram plot where the bins are shown as hexagons and the color represents the number of data points within each bin, from purple/blue as the fewest to red regions containing the most objects. Again, overplot the NEO class boundaries with labels in the $a$ versus $e$ plot.


```python
fig, axs = plt.subplots(2, 1, figsize=(6, 6))

axs[0].hexbin(uniqueNEOs.a,
              uniqueNEOs.incl,
              gridsize=(int(4.2/0.02), 50),
              cmap='Spectral_r', bins='log',
              extent=(0, 4.2, 0, 90))
axs[0].set_ylabel('inclination (deg)')
axs[0].minorticks_on()
axs[0].set_xlim(0., 4.)
axs[0].set_ylim(0., 90.)

axs[1].hexbin(uniqueNEOs.a,
              uniqueNEOs.e,
              gridsize=(int(4.2/0.02), 50),
              cmap='Spectral_r', bins='log',
              extent=(0, 4.2, 0, 1))
axs[1].plot(a_Q_Earth, e_Q_Earth, "blue")
axs[1].plot(a_q_Earth, e_q_Earth, "blue")
axs[1].axvline(x=1.0, color="blue")
axs[1].plot(a_q_NEO, e_q_NEO, "black", linewidth=5)
axs[1].set_ylabel('eccentricity')
axs[1].set_xlabel('semi-major axis (au)')

axs[1].set_xlim(0., 4.)
axs[1].set_ylim(0., 1.)
axs[1].minorticks_on()
plt.show()
```

A 2-panel scatter plot of ($a$, $i$; top) and ($a$, $e$; bottom) with all NEOs in the `uniqueNEOs` table split into the 4 sub-populations can also be plotted.


```python
fig, (ax1, ax2) = plt.subplots(2, 1)

ax1.set_xlim([0., 4.])
ax1.set_ylim([0., 90.])
ax1.scatter(uniqueNEOs[Amor_params].a,
            uniqueNEOs[Amor_params].incl,
            s=0.1, color='red',
            label="Amors")
ax1.scatter(uniqueNEOs[Apollo_params].a,
            uniqueNEOs[Apollo_params].incl,
            s=0.1, color='green',
            label="Apollos")
ax1.scatter(uniqueNEOs[Aten_params].a,
            uniqueNEOs[Aten_params].incl,
            s=0.1, color='orange',
            label="Atens")
ax1.scatter(uniqueNEOs[Atira_params].a,
            uniqueNEOs[Atira_params].incl,
            s=0.1, color='purple',
            label="Atiras")
ax1.minorticks_on()
ax1.set_ylabel("inclination (deg)")
ax1.set_title("NEOs in DP0.3")

ax2.set_xlim([0., 4.])
ax2.set_ylim([0., 1.])
ax2.scatter(uniqueNEOs[Amor_params].a,
            uniqueNEOs[Amor_params].e,
            s=0.1, color='red',
            label="Amors")
ax2.scatter(uniqueNEOs[Apollo_params].a,
            uniqueNEOs[Apollo_params].e,
            s=0.1, color='green',
            label="Apollos")
ax2.scatter(uniqueNEOs[Aten_params].a,
            uniqueNEOs[Aten_params].e,
            s=0.1, color='orange',
            label="Atens")
ax2.scatter(uniqueNEOs[Atira_params].a,
            uniqueNEOs[Atira_params].e,
            s=0.1, color='purple',
            label="Atiras")
ax2.plot(a_Q_Earth, e_Q_Earth, "blue")
ax2.plot(a_q_Earth, e_q_Earth, "blue")
ax2.axvline(x=1.0, color="blue")
ax2.plot(a_q_NEO, e_q_NEO, "black", linewidth=5)
ax2.annotate('Amors',
             xy=(2.4, 0.5), xytext=(2.4, 0.5),
             rotation=20.0, weight='bold', fontsize=10)
ax2.annotate('Apollos',
             xy=(1.45, 0.75), xytext=(1.45, 0.75),
             weight='bold', fontsize=10)
ax2.annotate('Atens',
             xy=(0.7, 0.6), xytext=(0.7, 0.6),
             rotation=270.0, weight='bold', fontsize=10)
ax2.annotate('Atiras',
             xy=(0.4, 0.5), xytext=(0.4, 0.5),
             rotation=280.0, weight='bold', fontsize=10)
ax2.minorticks_on()
ax2.set_xlabel("semimajor axis (au)")
ax2.set_ylabel("eccentricity")

plt.show()
```

It can also be helpful to make a 4-panel scatter plot showing the semimajor axes $a$ versus inclinations $i$ of each NEO sub-population individually.


```python
fig, axs = plt.subplots(2, 2)
fig.suptitle('NEO Inclinations in DP0.3')

axs[0, 0].set_xlim([0., 4.])
axs[0, 0].set_ylim([0., 90.])
axs[0, 0].scatter(uniqueNEOs[Atira_params].a,
                  uniqueNEOs[Atira_params].incl,
                  s=0.25, color='purple')
axs[0, 0].set_title('Atiras')
axs[0, 0].minorticks_on()

axs[0, 1].set_xlim([0., 4.])
axs[0, 1].set_ylim([0., 90.])
axs[0, 1].scatter(uniqueNEOs[Aten_params].a,
                  uniqueNEOs[Aten_params].incl,
                  s=0.1, color='orange')
axs[0, 1].set_title('Atens')
axs[0, 1].minorticks_on()

axs[1, 0].set_xlim([0., 4.])
axs[1, 0].set_ylim([0., 90.])
axs[1, 0].scatter(uniqueNEOs[Apollo_params].a,
                  uniqueNEOs[Apollo_params].incl,
                  s=0.1, color='green')
axs[1, 0].set_title('Apollos')
axs[1, 0].minorticks_on()
axs[1, 0].xaxis.set_tick_params(labelbottom=False)

axs[1, 1].set_xlim([0., 4.])
axs[1, 1].set_ylim([0., 90.])
axs[1, 1].scatter(uniqueNEOs[Amor_params].a,
                  uniqueNEOs[Amor_params].incl,
                  s=0.1, color='red')
axs[1, 1].set_title('Amors')
axs[1, 1].minorticks_on()
axs[1, 1].xaxis.set_tick_params(labelbottom=False)

for ax in axs.flat:
    ax.set(xlabel='semimajor axis (au)', ylabel='inclination (deg)')
for ax in axs.flat:
    ax.label_outer()
plt.show()
```

So far the above plots showing the inclination distribution of NEOs in the DP0.3 catalogs has been limited to inclinations $i<90$ deg. Now extend the inclination range in a ($a$, $i$) scatter plot beyond 90 deg to the retrograde ($90<i<180$ deg) region and label the prograde ($0<i<90$ deg) and retrograde regions.


```python
fig, ax = plt.subplots()
plt.xlim([0., 4.])
plt.ylim([0., 180.])
ax.scatter(uniqueNEOs.a, uniqueNEOs.incl, s=0.1)
ax.axhline(y=90.0, color="black", linestyle="dotted")
ax.annotate('prograde', xy=(0.05, 80.0), xytext=(0.05, 80.0))
ax.annotate('retrograde', xy=(0.05, 95.0), xytext=(0.05, 95.0))
plt.xlabel("semimajor axis (au)")
plt.ylabel("inclination (deg)")
plt.title("NEOs in DP0.3")
```

The retrograde (i>90 deg) NEOs in the DP0.3 catalogs can be extracted and plotted with their object designations labeled.


```python
high_i = (uniqueNEOs.incl > 90.0) & (uniqueNEOs.q < 1.3)
print(len(uniqueNEOs[high_i]))
print(uniqueNEOs[high_i][['mpcDesignation', 'q', 'a', 'e', 'incl']])
```


```python
fig, ax = plt.subplots()
plt.xlim([0., 4.])
plt.ylim([90., 180.])
ax.scatter(uniqueNEOs[high_i].a, uniqueNEOs[high_i].incl)
ax.annotate(uniqueNEOs[high_i].iloc[0].mpcDesignation,
            xy=(uniqueNEOs[high_i].iloc[0].a,
                uniqueNEOs[high_i].iloc[0].incl),
            xytext=(uniqueNEOs[high_i].iloc[0].a+0.1,
                    uniqueNEOs[high_i].iloc[0].incl-2.),
            fontsize=10)
ax.annotate(uniqueNEOs[high_i].iloc[1].mpcDesignation,
            xy=(uniqueNEOs[high_i].iloc[1].a,
                uniqueNEOs[high_i].iloc[1].incl),
            xytext=(uniqueNEOs[high_i].iloc[1].a-0.65,
                    uniqueNEOs[high_i].iloc[1].incl-2.),
            fontsize=10)
ax.annotate(uniqueNEOs[high_i].iloc[2].mpcDesignation,
            xy=(uniqueNEOs[high_i].iloc[2].a,
                uniqueNEOs[high_i].iloc[2].incl),
            xytext=(uniqueNEOs[high_i].iloc[2].a+0.1,
                    uniqueNEOs[high_i].iloc[2].incl-2.),
            fontsize=10)
ax.annotate(uniqueNEOs[high_i].iloc[3].mpcDesignation,
            xy=(uniqueNEOs[high_i].iloc[3].a,
                uniqueNEOs[high_i].iloc[3].incl),
            xytext=(uniqueNEOs[high_i].iloc[3].a+0.1,
                    uniqueNEOs[high_i].iloc[3].incl-2.),
            fontsize=10)
ax.annotate(uniqueNEOs[high_i].iloc[4].mpcDesignation,
            xy=(uniqueNEOs[high_i].iloc[4].a,
                uniqueNEOs[high_i].iloc[4].incl),
            xytext=(uniqueNEOs[high_i].iloc[4].a+0.1,
                    uniqueNEOs[high_i].iloc[4].incl-2.),
            fontsize=10)
ax.annotate(uniqueNEOs[high_i].iloc[5].mpcDesignation,
            xy=(uniqueNEOs[high_i].iloc[5].a,
                uniqueNEOs[high_i].iloc[5].incl),
            xytext=(uniqueNEOs[high_i].iloc[5].a+0.1,
                    uniqueNEOs[high_i].iloc[5].incl-2.),
            fontsize=10)
plt.xlabel("semimajor axis (au)")
plt.ylabel("inclination (deg)")
plt.title("Retrograde NEOs in DP0.3")
```

### Exercises for the learner:

1. Plot the subset of Apollos that are only Venus-crossing (i.e., exclude the Earth-crossing Apollos).

2. Compute the percentage of NEOs on retrograde (incl > 90 deg) orbits.

3. Make a 4-panel plot showing the 1-D inclination distributions for each of the four NEO sub-populations individually.

4. How many objects in the `uniqueNEOs` table are interstellar objects (with prefix "iso" in their mpcDesignation)? Query the DP0.3 tables to include the interstellar objects and plot their semimajor axes, eccentricities, and inclinations.


```python

```

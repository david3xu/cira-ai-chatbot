                instantsearch/examples/js/e-commerce/index.html at master · algolia/instantsearch · GitHub                                         

[Skip to content](#start-of-content)

Navigation Menu
---------------

Toggle navigation

[](/)

[Sign in](/login?return_to=https%3A%2F%2Fgithub.com%2Falgolia%2Finstantsearch%2Fblob%2Fmaster%2Fexamples%2Fjs%2Fe-commerce%2Findex.html)

Search or jump to...

Search code, repositories, users, issues, pull requests...
==========================================================

Search

Clear

[Search syntax tips](https://docs.github.com/search-github/github-code-search/understanding-github-code-search-syntax)

Provide feedback
================

We read every piece of feedback, and take your input very seriously.

 Include my email address so I can be contacted

Cancel Submit feedback

Saved searches
==============

Use saved searches to filter your results more quickly
------------------------------------------------------

Name  

Query 

To see all available qualifiers, see our [documentation](https://docs.github.com/search-github/github-code-search/understanding-github-code-search-syntax).

Cancel Create saved search

[Sign in](/login?return_to=https%3A%2F%2Fgithub.com%2Falgolia%2Finstantsearch%2Fblob%2Fmaster%2Fexamples%2Fjs%2Fe-commerce%2Findex.html)

[Sign up](/signup?ref_cta=Sign+up&ref_loc=header+logged+out&ref_page=%2F%3Cuser-name%3E%2F%3Crepo-name%3E%2Fblob%2Fshow&source=header-repo&source_repo=algolia%2Finstantsearch)

You signed in with another tab or window. Reload to refresh your session. You signed out in another tab or window. Reload to refresh your session. You switched accounts on another tab or window. Reload to refresh your session. Dismiss alert

[algolia](/algolia) / **[instantsearch](/algolia/instantsearch)** Public

*   [Notifications](/login?return_to=%2Falgolia%2Finstantsearch) You must be signed in to change notification settings
*   [Fork 504](/login?return_to=%2Falgolia%2Finstantsearch)
*   [Star 3.6k](/login?return_to=%2Falgolia%2Finstantsearch)
    

  Files
-----

 master

/

index.html
==========

Blame

Blame

Latest commit
-------------

History
-------

[History](/algolia/instantsearch/commits/master/examples/js/e-commerce/index.html)

[](/algolia/instantsearch/commits/master/examples/js/e-commerce/index.html)

executable file

·

127 lines (110 loc) · 6.32 KB

 master

/

index.html
==========

Top

File metadata and controls
--------------------------

*   Code
    
*   Blame
    

executable file

·

127 lines (110 loc) · 6.32 KB

[Raw](https://github.com/algolia/instantsearch/raw/master/examples/js/e-commerce/index.html)

1

2

3

4

5

6

7

8

9

10

11

12

13

14

15

16

17

18

19

20

21

22

23

24

25

26

27

28

29

30

31

32

33

34

35

36

37

38

39

40

41

42

43

44

45

46

47

48

49

50

51

52

53

54

55

56

57

58

59

60

61

62

63

64

65

66

67

68

69

70

71

72

73

74

75

76

77

78

79

80

81

82

83

84

85

86

87

88

89

90

91

92

93

94

95

96

97

98

99

100

101

102

103

104

105

106

107

108

109

110

111

112

113

114

115

116

117

118

119

120

121

122

123

124

125

126

127

<!DOCTYPE html\>

<html lang\="en"\>

<head\>

<meta charset\="utf-8" />

<meta

name\="viewport"

content\="width=device-width, initial-scale=1, shrink-to-fit=no"

/>

<meta name\="theme-color" content\="#e2a400" />

<base href\="/examples/js/e-commerce/" />

<link rel\="manifest" href\="./manifest.webmanifest" />

<link rel\="shortcut icon" href\="./favicon.png" />

<link

rel\="stylesheet"

href\="https://fonts.googleapis.com/css?family=Hind:400,600|Open+Sans:300,400,700&display=swap"

/>

<!--

Do not use @8 in production, use a complete version like x.x.x, see website for latest version:

https://www.algolia.com/doc/guides/building-search-ui/installation/js/#load-the-styles

\-->

<link

rel\="stylesheet"

href\="https://cdn.jsdelivr.net/npm/instantsearch.css@8/themes/reset-min.css"

/>

<link rel\="stylesheet" href\="./src/theme.css" />

<link rel\="stylesheet" href\="./src/app.css" />

<link rel\="stylesheet" href\="./src/app.mobile.css" />

<link rel\="stylesheet" href\="./src/widgets/PriceSlider.css" />

<script src\="./polyfills.js"\></script\>

<title\>E-commerce demo | Algolia</title\>

</head\>

<body\>

<header class\="header" id\="header"\>

<p class\="header-logo"\>

<a href\="https://algolia.com" aria-label\="Go to the Algolia website"\>

<svg xmlns\="http://www.w3.org/2000/svg" viewBox\="0 0 512 117"\>

<path

fill\="#FFF"

d\="M249.5 64.2V1.4c0-.9-.7-1.5-1.6-1.4L236.2 2a1.4 1.4 0 0 0-1.2 1.3V67c0 3 0 21.6 22.4 22.3a1.4 1.4 0 0 0 1.5-1.4v-9.5c0-.7-.6-1.3-1.2-1.4-8.2-.9-8.2-11-8.2-12.7ZM443.5 24.4h-11.8c-.8 0-1.4.6-1.4 1.4v62c0 .8.6 1.4 1.4 1.4h11.8c.8 0 1.4-.6 1.4-1.4v-62c0-.8-.6-1.4-1.4-1.4ZM431.7 16.6h11.8c.8 0 1.4-.6 1.4-1.3v-14c0-.8-.7-1.4-1.6-1.3L431.5 2a1.4 1.4 0 0 0-1.2 1.3v12c0 .8.6 1.4 1.4 1.4Zm-20.5 47.6V1.4c0-.9-.7-1.5-1.5-1.4L397.9 2a1.4 1.4 0 0 0-1.2 1.3V67c0 3 0 21.6 22.4 22.3a1.4 1.4 0 0 0 1.5-1.4v-9.5c0-.7-.5-1.3-1.2-1.4-8.2-.9-8.2-11-8.2-12.7Zm-30.7-31c-2.6-2.8-5.8-5-9.6-6.5a31.7 31.7 0 0 0-12-2.3c-4.5 0-8.5.7-12.2 2.3A27.9 27.9 0 0 0 331 43.5a39.6 39.6 0 0 0 0 26.3c1.5 4 3.6 7.5 6.2 10.3 2.6 2.9 5.8 5 9.5 6.7a38 38 0 0 0 12.2 2.4c2.8 0 8.6-.9 12.3-2.4a27 27 0 0 0 9.5-6.7 35.1 35.1 0 0 0 8.3-23c0-4.9-.8-9.6-2.4-13.6-1.5-4-3.5-7.4-6.1-10.2ZM370 71.5a13.1 13.1 0 0 1-11.2 5.6 13 13 0 0 1-11.2-5.6c-2.7-3.6-4-7.9-4-14.2 0-6.3 1.3-11.5 4-15.1a13 13 0 0 1 11.1-5.5 13 13 0 0 1 11.3 5.5c2.6 3.6 4 8.8 4 15 0 6.4-1.3 10.6-4 14.3Zm-161.6-47H197a32 32 0 0 0-27 15 33.8 33.8 0 0 0 8.9 45.9 18.8 18.8 0 0 0 11.2 3.1H191.2l.6-.2h.2a21 21 0 0 0 16.5-14.6V87c0 .8.6 1.4 1.4 1.4h11.7c.8 0 1.4-.6 1.4-1.4V25.8c0-.8-.6-1.4-1.4-1.4h-13Zm0 48.3a17.8 17.8 0 0 1-10.4 3.5h-.2a12.5 12.5 0 0 1-.7 0A18.4 18.4 0 0 1 180.4 51c2.7-6.8 9-11.6 16.6-11.6h11.5v33.3Zm289-48.3H486a32 32 0 0 0-27 15 33.8 33.8 0 0 0 8.8 45.9 18.8 18.8 0 0 0 11.3 3.1h1.1l.6-.2h.2a21 21 0 0 0 16.5-14.6V87c0 .8.6 1.4 1.4 1.4h11.7c.8 0 1.4-.6 1.4-1.4V25.8c0-.8-.6-1.4-1.4-1.4h-13.1Zm0 48.3a17.8 17.8 0 0 1-10.5 3.5h-.9A18.4 18.4 0 0 1 469.4 51c2.6-6.8 9-11.6 16.6-11.6h11.5v33.3ZM306.3 24.4h-11.5a32 32 0 0 0-27 15 33.7 33.7 0 0 0-5.1 14.6 34.6 34.6 0 0 0 0 7.6c1 8.9 5.4 16.7 11.8 22a19.5 19.5 0 0 0 2.2 1.7 18.8 18.8 0 0 0 21.6-.6c3.8-2.7 6.7-6.7 8-11.1V87.9c0 5-1.3 8.9-4 11.5-2.7 2.6-7.3 3.9-13.6 3.9-2.6 0-6.7-.2-10.9-.6a1.4 1.4 0 0 0-1.4 1l-3 10a1.4 1.4 0 0 0 1.1 1.8c5 .7 10 1 12.8 1 11.4 0 19.8-2.4 25.3-7.4 5-4.6 7.8-11.4 8.2-20.7V25.8c0-.8-.6-1.4-1.3-1.4h-13.2Zm0 15s.2 32.4 0 33.4a17.5 17.5 0 0 1-10 3.4h-.2a13.6 13.6 0 0 1-1.7 0A18.7 18.7 0 0 1 278.3 51c2.6-6.8 9-11.6 16.5-11.6h11.5ZM58.2 0A58.3 58.3 0 1 0 86 109.5c.9-.5 1-1.6.3-2.2l-5.5-4.9a3.8 3.8 0 0 0-4-.6A47 47 0 0 1 11 57.5 47.3 47.3 0 0 1 58.2 11h47.3v84L78.7 71.2a2 2 0 0 0-3 .3 22 22 0 1 1 4.4-15.2 4 4 0 0 0 1.3 2.6l7 6.2c.8.7 2 .3 2.3-.8a33 33 0 0 0-30.4-39 33 33 0 0 0-35 32 33.3 33.3 0 0 0 32.2 33.9 32.8 32.8 0 0 0 20-6.3l35.1 31c1.5 1.4 3.9.3 3.9-1.7V2.2a2.2 2.2 0 0 0-2.2-2.2h-56Z"

/>

</svg\>

</a\>

</p\>

<p class\="header-title"\>Stop looking for an item — find it.</p\>

<div data-widget\="searchbox"\></div\>

</header\>

<main class\="container"\>

<div class\="container-wrapper"\>

<section class\="container-filters"\>

<div class\="container-header"\>

<h2\>Filters</h2\>

<div data-widget\="clear-filters" data-layout\="desktop"\></div\>

<div data-widget\="results-number-mobile" data-layout\="mobile"\></div\>

</div\>

<div class\="container-body"\>

<div data-widget\="categories"\></div\>

<div data-widget\="brands"\></div\>

<div data-widget\="price-range"\></div\>

<div data-widget\="free-shipping"\></div\>

<div data-widget\="ratings"\></div\>

</div\>

</section\>

<footer class\="container-filters-footer" data-layout\="mobile"\>

<div

class\="container-filters-footer-button-wrapper"

data-widget\="clear-filters-mobile"

\></div\>

<div

class\="container-filters-footer-button-wrapper"

data-widget\="save-filters-mobile"

data-action\="close-overlay"

\></div\>

</footer\>

</div\>

<section class\="container-results"\>

<header class\="container-header container-options"\>

<div class\="container-option" data-widget\="sort-by"\></div\>

<div class\="container-option" data-widget\="hits-per-page"\></div\>

</header\>

<div data-widget\="hits"\></div\>

<div class\="hits-empty-state"\>

<div

data-widget\="clear-filters-empty-state"

class\="hits-empty-results"

\></div\>

</div\>

<footer class\="container-footer"\>

<nav data-widget\="pagination"\></nav\>

</footer\>

</section\>

</main\>

<aside data-layout\="mobile"\>

<button class\="filters-button" data-action\="open-overlay"\>

<svg xmlns\="http://www.w3.org/2000/svg" viewbox\="0 0 16 14"\>

<path

d\="M15 1H1l5.6 6.3v4.37L9.4 13V7.3z"

stroke\="#fff"

stroke-width\="1.29"

fill\="none"

fill-rule\="evenodd"

stroke-linecap\="round"

stroke-linejoin\="round"

/>

</svg\>

Filters

</button\>

</aside\>

<script type\="module" src\="./src/app.ts"\></script\>

</body\>

</html\>

You can’t perform that action at this time.
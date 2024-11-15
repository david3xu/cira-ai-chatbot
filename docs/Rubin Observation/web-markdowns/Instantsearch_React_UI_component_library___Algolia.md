Instantsearch React UI component library | Algolia

React + Algolia
===============

Build search experiences with UI components and libraries.

[

Sign up

](https://www.algolia.com/users/sign_up?techStack=React)

### What is Algolia

Algolia empowers modern developers to build world class search and discovery experiences without any DevOps.  
Libraries with every major language and framework make it easy to enrich your users' experiences. 

[Learn more about the Algolia products](/products/)

### Add autocomplete to your react applications

React InstantSearch UI library is pre-built, customizable and flexible UI widgets to create your own search experiences -  [explore the showcase](https://www.algolia.com/doc/guides/building-search-ui/widgets/showcase/react/). It has server side rendering and routing capabilities and is Open source, production-ready and maintained by Algolia.

[Get started with React InstantSearch](https://www.algolia.com/doc/guides/building-search-ui/getting-started/react-hooks/)

### Features

*   Provides pre-built UI components following best practice principles for React that remain independent from external frameworks
    
*   Integrate into your existing UI or app, or use InstantSearch templates
    
*   Comes with a default CSS theme, completely customizable
    
*   Manages all business logic for search requests, responses, and states
    
*   Progressive customization of components (use, extend, or customize)
    

### Version

*   Compatible with all current versions of the underlying React library
    
*   Code is entirely open source and available on GitHub
    
*   Bootstrap your application, with create-instantsearch-app, NPM, ...
    

### Related Integrations

*   Works with [Autocomplete](https://www.algolia.com/developers/autocomplete-library-javascript/) 
*   And with all our [API clients](https://www.algolia.com/developers/?refinementList%5Btype%5D%5B0%5D=API%20clients&page=1&configure%5BhitsPerPage%5D=15&configure%5BclickAnalytics%5D=true#integrations) and [frameworks](https://www.algolia.com/developers/?refinementList%5Btype%5D%5B0%5D=Frameworks&page=1&configure%5BhitsPerPage%5D=15&configure%5BclickAnalytics%5D=true#integrations)

### Key links

[Documentation](https://www.algolia.com/doc/api-reference/widgets/react-hooks/)[GitHub repo](https://github.com/algolia/instantsearch/tree/master/packages/react-instantsearch-core)[Discord Server](https://alg.li/discord)[Code Exchange](/developers/code-exchange/)[Support](https://support.algolia.com/hc/en-us)

Get started
-----------

*   CSS (get a free account [here](https://www.algolia.com/users/sign_up?techStack=React))
    
    Copy
    
    1
    
        body { font-family: sans-serif; padding: 1em; }
    
    `2  .ais-SearchBox { margin: 1em 0; }  `
    
    `3  .ais-Pagination { margin-top: 1em }  `
    
    `4  .left-panel { float: left; width: 250px; }  `
    
    `5`
    
    `.right-panel { margin-left: 260px; }`
    
*   Import Components
    
    Copy
    
    1
    
        import {
    
    `2    InstantSearch,  `
    
    `3    Highlight,  `
    
    `4    Hits,  `
    
    `5    SearchBox,  `
    
    `6`
    
    `} from 'react-instantsearch-hooks-web';`
    
*   Search
    
    Copy
    
    1
    
        // Create the App component
    
    `2  class App extends Component {  `
    
    `3    render() {  `
    
    `4      return (  `
    
    `5        <div className="ais-InstantSearch">  `
    
    `6          <h1>React InstantSearch e-commerce demo</h1>  `
    
    `7          <InstantSearch indexName="demo_ecommerce" searchClient={searchClient}>  `
    
    `8            <div className="right-panel">  `
    
    `9              <SearchBox />  `
    
    `10              <Hits hitComponent={Hit} />  `
    
    `11            </div>  `
    
    `12          </InstantSearch>  `
    
    `13        </div>  `
    
    `14      );  `
    
    `15    }  `
    
    `16  }  `
    
    `17  `
    
    `18  `
    
    `19  function Hit(props) {  `
    
    `20    return (  `
    
    `21      <div>  `
    
    `22        <img src={props.hit.image} align="left" alt={props.hit.name} />  `
    
    `23        <div className="hit-name">  `
    
    `24          <Highlight attribute="name" hit={props.hit} />  `
    
    `25        </div>  `
    
    `26        <div className="hit-description">  `
    
    `27          <Highlight attribute="description" hit={props.hit} />  `
    
    `28        </div>  `
    
    `29        <div className="hit-price">${props.hit.price}</div>  `
    
    `30      </div>  `
    
    `31    );  `
    
    `32`
    
    `}`
    

[

Get started for free

](https://www.algolia.com/users/sign_up/)[

Explore developer docs

](https://www.algolia.com/doc/)

Built with React on Algolia
---------------------------

*   [
    
    Frontend ToolsTemplates & Starters
    
    #### Ecommerce Starter
    
    Starter for product search powered by Algolia InstantSearch
    
    *   JavaScript
        
    *   Node.js
        
    *   React
        
    *   Vanilla JavaScript
        
    *   Vue
        
    *   Angular
        
    *   InstantSearch
        
    *   eCommerce
        
    
    Algolia
    
    
    
    
    
    ](https://github.com/algolia/instantsearch/tree/master/examples/js/e-commerce)
*   [
    
    Frontend ToolsTemplates & Starters
    
    #### Media Search Starter
    
    Starter for video search powered by Algolia InstantSearch
    
    *   Node.js
        
    *   JavaScript
        
    *   React
        
    *   Vanilla JavaScript
        
    *   Vue
        
    *   Angular
        
    *   InstantSearch
        
    *   Media
        
    
    Algolia
    
    
    
    
    
    ](https://github.com/algolia/instantsearch/tree/master/examples/js/media)
const fetch = require("node-fetch")
const queryString = require("query-string")

// Gatsby expects exported sourceNodes to be a function with the
// signature (apiOptions, pluginOptions)
// https://www.gatsbyjs.org/docs/node-apis/#sourceNodes
// apiOptions is an object with the following shape:
// {   
//     actions: Object,
//     createContentDigest: Function,
//     createNodeId: Function,
//     getNodes: Function,
//     getNode: Function,
//     hasNodeChanged: Function,
//     reporter: Object,
//     store: Object,
//     cache: Object,
//     createPage: Function,
//     deletePage: Function,
//     createRedirect: Function,
//     createNode: Function,
//     deleteNode: Function,
//     touchNode: Function,
//     createNodeField: Function,
//     createParentChildLink: Function,
//     createPageDependency: Function,
//     createRemoteFileNode: Function,
//     plugin: Object,
//     [Symbol(Symbol.toStringTag)]: "AsyncFunction"
// }
// pluginOptions is an object with the following shape:
// {
//     plugins: Array,
//     base: String,
//     access_key: String,
//     symbols: String,
//     format: String,
//     [Symbol(Symbol.toStringTag)]: "Object"
// }
exports.sourceNodes = async (
    { actions, createNodeId, createContentDigest },
    configOptions
) => {
    const { createNode } = actions
    delete configOptions.plugins
    console.log("Testing the plugin", configOptions)
    // Gatsby adds a configOption that's not needed for this plugin, delete it
    // Helper function that processes a fixer to match Gatsby's node structure
    const processFixer = (base, rates) => {
        const nodeId = createNodeId(`fixer-${base}`)
        const nodeContent = JSON.stringify(rates)
        const nodeData = Object.assign({}, rates, {
            id: nodeId,
            parent: null,
            children: [],
            internal: {
                type: `Fixer`,
                content: nodeContent,
                contentDigest: createContentDigest(rates),
            },
        })
        return nodeData
    }
    const apiOptions = queryString.stringify(configOptions)
    // Helper function that processes a fixer to match Gatsby's node structure
    const apiUrl = `http://data.fixer.io/api/latest?{apiOptions}`
    // Convert the options object into a query string
    const fetchResponse = await fetch(apiUrl)
    const rates = await fetchResponse.json()
    // Rates is an object with the various currencies as keys
    Object.keys(rates).forEach((key) => {
        if (key !== "base") {
            rates[key] = {
                rate: rates[key],
            }
        }
    })
    const nodeData = processFixer(configOptions.base, rates)
    createNode(nodeData)
    // Gatsby expects sourceNodes to return a promise
    return
}
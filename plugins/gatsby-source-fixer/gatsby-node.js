const fetch = require("node-fetch")
const queryString = require("query-string")
exports.sourceNodes = async (
    { actions, createNodeId, createContentDigest },
    configOptions
) => {
    const { createNode } = actions
    delete configOptions.plugins
    console.log("Testing the plugin", configOptions)
    // Gatsby adds a configOption that's not needed for this plugin, delete it
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
    // Helper function that processes a fixer to match Gatsby's node structure
    const apiUrl = `http://data.fixer.io/api/latest?access_key=${configOptions.access_key}`
    // Convert the options object into a query string
    const fetchResponse = await fetch(apiUrl)
    const rates = await fetchResponse.json()
    const nodeData = processFixer(configOptions.base, rates)
    createNode(nodeData)
    // Gatsby expects sourceNodes to return a promise
    return
}
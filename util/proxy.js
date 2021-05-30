const ProxyAgent = require('proxy-agent')

/**
 * @param {string=} proxy - Proxy URI
 * @returns {{ http?: import('http').Agent; https?: import('https').Agent } | false}
 */
function getProxyAgent (proxy) {
  if (proxy) {
    const agent = new ProxyAgent(proxy)
    return {
      http: agent,
      https: agent
    }
  }

  let agent

  const httpProxy = process.env.http_proxy || process.env.HTTP_PROXY
  if (httpProxy) {
    agent = agent || {}
    agent.http = new ProxyAgent(httpProxy)
  }

  const httpsProxy = process.env.https_proxy || process.env.HTTPS_PROXY
  if (httpsProxy) {
    agent = agent || {}
    agent.https = new ProxyAgent(httpsProxy)
  }

  return agent || false
}

exports.getProxyAgent = getProxyAgent

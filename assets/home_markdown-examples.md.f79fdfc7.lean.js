import{_ as i,v as l,b as o,C as r,B as t,F as p,L as c,R as d,M as b}from"./chunks/framework.bd8c9a46.js";const f=JSON.parse('{"title":"Markdown Extension Examples","description":"","frontmatter":{},"headers":[],"relativePath":"home/markdown-examples.md","filePath":"home/markdown-examples.md","lastUpdated":1692511611000}'),h={name:"home/markdown-examples.md"},m=p("h1",{id:"markdown-extension-examples",tabindex:"-1"},[c("Markdown Extension Examples "),p("a",{class:"header-anchor",href:"#markdown-extension-examples","aria-label":'Permalink to "Markdown Extension Examples"'},"​")],-1),u=d(`<p>This page demonstrates some of the built-in markdown extensions provided by VitePress.</p><h2 id="syntax-highlighting" tabindex="-1">Syntax Highlighting <a class="header-anchor" href="#syntax-highlighting" aria-label="Permalink to &quot;Syntax Highlighting&quot;">​</a></h2><p>VitePress provides Syntax Highlighting powered by <a href="https://github.com/shikijs/shiki" target="_blank" rel="noreferrer">Shiki</a>, with additional features like line-highlighting:</p><p><strong>Input</strong></p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki github-dark-dimmed vp-code-dark"><code><span class="line"><span style="color:#adbac7;">\`\`\`js{4}</span></span>
<span class="line"><span style="color:#adbac7;">export default {</span></span>
<span class="line"><span style="color:#adbac7;">  data () {</span></span>
<span class="line"><span style="color:#adbac7;">    return {</span></span>
<span class="line"><span style="color:#adbac7;">      msg: &#39;Highlighted!&#39;</span></span>
<span class="line"><span style="color:#adbac7;">    }</span></span>
<span class="line"><span style="color:#adbac7;">  }</span></span>
<span class="line"><span style="color:#adbac7;">}</span></span>
<span class="line"><span style="color:#adbac7;">\`\`\`</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292e;">\`\`\`js{4}</span></span>
<span class="line"><span style="color:#24292e;">export default {</span></span>
<span class="line"><span style="color:#24292e;">  data () {</span></span>
<span class="line"><span style="color:#24292e;">    return {</span></span>
<span class="line"><span style="color:#24292e;">      msg: &#39;Highlighted!&#39;</span></span>
<span class="line"><span style="color:#24292e;">    }</span></span>
<span class="line"><span style="color:#24292e;">  }</span></span>
<span class="line"><span style="color:#24292e;">}</span></span>
<span class="line"><span style="color:#24292e;">\`\`\`</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br></div></div><p><strong>Output</strong></p><div class="language-js vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">js</span><pre class="shiki github-dark-dimmed has-highlighted-lines vp-code-dark"><code><span class="line"><span style="color:#F47067;">export</span><span style="color:#F69D50;"> </span><span style="color:#F47067;">default</span><span style="color:#F69D50;"> {</span></span>
<span class="line"><span style="color:#F69D50;">  </span><span style="color:#DCBDFB;">data</span><span style="color:#F69D50;"> () </span><span style="color:#ADBAC7;">{</span></span>
<span class="line"><span style="color:#ADBAC7;">    </span><span style="color:#F47067;">return</span><span style="color:#ADBAC7;"> {</span></span>
<span class="line highlighted"><span style="color:#ADBAC7;">      msg: </span><span style="color:#96D0FF;">&#39;Highlighted!&#39;</span></span>
<span class="line"><span style="color:#ADBAC7;">    }</span></span>
<span class="line"><span style="color:#ADBAC7;">  }</span></span>
<span class="line"><span style="color:#F69D50;">}</span></span></code></pre><pre class="shiki github-light has-highlighted-lines vp-code-light"><code><span class="line"><span style="color:#D73A49;">export</span><span style="color:#24292E;"> </span><span style="color:#D73A49;">default</span><span style="color:#24292E;"> {</span></span>
<span class="line"><span style="color:#24292E;">  </span><span style="color:#6F42C1;">data</span><span style="color:#24292E;"> () {</span></span>
<span class="line"><span style="color:#24292E;">    </span><span style="color:#D73A49;">return</span><span style="color:#24292E;"> {</span></span>
<span class="line highlighted"><span style="color:#24292E;">      msg: </span><span style="color:#032F62;">&#39;Highlighted!&#39;</span></span>
<span class="line"><span style="color:#24292E;">    }</span></span>
<span class="line"><span style="color:#24292E;">  }</span></span>
<span class="line"><span style="color:#24292E;">}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br></div></div><h2 id="custom-containers" tabindex="-1">Custom Containers <a class="header-anchor" href="#custom-containers" aria-label="Permalink to &quot;Custom Containers&quot;">​</a></h2><p><strong>Input</strong></p><div class="language-md vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">md</span><pre class="shiki github-dark-dimmed vp-code-dark"><code><span class="line"><span style="color:#ADBAC7;">::: info</span></span>
<span class="line"><span style="color:#ADBAC7;">This is an info box.</span></span>
<span class="line"><span style="color:#ADBAC7;">:::</span></span>
<span class="line"></span>
<span class="line"><span style="color:#ADBAC7;">::: tip</span></span>
<span class="line"><span style="color:#ADBAC7;">This is a tip.</span></span>
<span class="line"><span style="color:#ADBAC7;">:::</span></span>
<span class="line"></span>
<span class="line"><span style="color:#ADBAC7;">::: warning</span></span>
<span class="line"><span style="color:#ADBAC7;">This is a warning.</span></span>
<span class="line"><span style="color:#ADBAC7;">:::</span></span>
<span class="line"></span>
<span class="line"><span style="color:#ADBAC7;">::: danger</span></span>
<span class="line"><span style="color:#ADBAC7;">This is a dangerous warning.</span></span>
<span class="line"><span style="color:#ADBAC7;">:::</span></span>
<span class="line"></span>
<span class="line"><span style="color:#ADBAC7;">::: details</span></span>
<span class="line"><span style="color:#ADBAC7;">This is a details block.</span></span>
<span class="line"><span style="color:#ADBAC7;">:::</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292E;">::: info</span></span>
<span class="line"><span style="color:#24292E;">This is an info box.</span></span>
<span class="line"><span style="color:#24292E;">:::</span></span>
<span class="line"></span>
<span class="line"><span style="color:#24292E;">::: tip</span></span>
<span class="line"><span style="color:#24292E;">This is a tip.</span></span>
<span class="line"><span style="color:#24292E;">:::</span></span>
<span class="line"></span>
<span class="line"><span style="color:#24292E;">::: warning</span></span>
<span class="line"><span style="color:#24292E;">This is a warning.</span></span>
<span class="line"><span style="color:#24292E;">:::</span></span>
<span class="line"></span>
<span class="line"><span style="color:#24292E;">::: danger</span></span>
<span class="line"><span style="color:#24292E;">This is a dangerous warning.</span></span>
<span class="line"><span style="color:#24292E;">:::</span></span>
<span class="line"></span>
<span class="line"><span style="color:#24292E;">::: details</span></span>
<span class="line"><span style="color:#24292E;">This is a details block.</span></span>
<span class="line"><span style="color:#24292E;">:::</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br></div></div><p><strong>Output</strong></p><div class="info custom-block"><p class="custom-block-title">INFO</p><p>This is an info box.</p></div><div class="tip custom-block"><p class="custom-block-title">TIP</p><p>This is a tip.</p></div><div class="warning custom-block"><p class="custom-block-title">WARNING</p><p>This is a warning.</p></div><div class="danger custom-block"><p class="custom-block-title">DANGER</p><p>This is a dangerous warning.</p></div><details class="details custom-block"><summary>Details</summary><p>This is a details block.</p></details><h2 id="more" tabindex="-1">More <a class="header-anchor" href="#more" aria-label="Permalink to &quot;More&quot;">​</a></h2><p>Check out the documentation for the <a href="https://vitepress.dev/guide/markdown" target="_blank" rel="noreferrer">full list of markdown extensions</a>.</p>`,18);function y(s,g,A,k,v,C){var n,a;const e=b("ArticleMetadata");return l(),o("div",null,[m,(((n=s.$frontmatter)==null?void 0:n.aside)??!0)&&(((a=s.$frontmatter)==null?void 0:a.showArticleMetadata)??!0)?(l(),r(e,{key:0,article:s.$frontmatter},null,8,["article"])):t("",!0),u])}const E=i(h,[["render",y]]);export{f as __pageData,E as default};

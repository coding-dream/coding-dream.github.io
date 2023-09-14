import{c as d,v as r,b as h,C as u,B as b,F as a,X as n,N as t,L as s,R as g,M as f}from"./chunks/framework.bd8c9a46.js";const y=a("h1",{id:"runtime-api-examples",tabindex:"-1"},[s("Runtime API Examples "),a("a",{class:"header-anchor",href:"#runtime-api-examples","aria-label":'Permalink to "Runtime API Examples"'},"​")],-1),C=g(`<p>This page demonstrates usage of some of the runtime APIs provided by VitePress.</p><p>The main <code>useData()</code> API can be used to access site, theme, and page data for the current page. It works in both <code>.md</code> and <code>.vue</code> files:</p><div class="language-md vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">md</span><pre class="shiki github-dark-dimmed vp-code-dark"><code><span class="line"><span style="color:#ADBAC7;">&lt;script setup&gt;</span></span>
<span class="line"><span style="color:#ADBAC7;">import { useData } from &#39;vitepress&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#ADBAC7;">const { theme, page, frontmatter } = useData()</span></span>
<span class="line"><span style="color:#ADBAC7;">&lt;/script&gt;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6CB6FF;font-weight:bold;">## Results</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6CB6FF;font-weight:bold;">### Theme Data</span></span>
<span class="line"><span style="color:#ADBAC7;">&lt;pre&gt;{{ theme }}&lt;/pre&gt;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6CB6FF;font-weight:bold;">### Page Data</span></span>
<span class="line"><span style="color:#ADBAC7;">&lt;pre&gt;{{ page }}&lt;/pre&gt;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6CB6FF;font-weight:bold;">### Page Frontmatter</span></span>
<span class="line"><span style="color:#ADBAC7;">&lt;pre&gt;{{ frontmatter }}&lt;/pre&gt;</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292E;">&lt;script setup&gt;</span></span>
<span class="line"><span style="color:#24292E;">import { useData } from &#39;vitepress&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#24292E;">const { theme, page, frontmatter } = useData()</span></span>
<span class="line"><span style="color:#24292E;">&lt;/script&gt;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#005CC5;font-weight:bold;">## Results</span></span>
<span class="line"></span>
<span class="line"><span style="color:#005CC5;font-weight:bold;">### Theme Data</span></span>
<span class="line"><span style="color:#24292E;">&lt;pre&gt;{{ theme }}&lt;/pre&gt;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#005CC5;font-weight:bold;">### Page Data</span></span>
<span class="line"><span style="color:#24292E;">&lt;pre&gt;{{ page }}&lt;/pre&gt;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#005CC5;font-weight:bold;">### Page Frontmatter</span></span>
<span class="line"><span style="color:#24292E;">&lt;pre&gt;{{ frontmatter }}&lt;/pre&gt;</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br></div></div><h2 id="results" tabindex="-1">Results <a class="header-anchor" href="#results" aria-label="Permalink to &quot;Results&quot;">​</a></h2><h3 id="theme-data" tabindex="-1">Theme Data <a class="header-anchor" href="#theme-data" aria-label="Permalink to &quot;Theme Data&quot;">​</a></h3>`,5),_=a("h3",{id:"page-data",tabindex:"-1"},[s("Page Data "),a("a",{class:"header-anchor",href:"#page-data","aria-label":'Permalink to "Page Data"'},"​")],-1),A=a("h3",{id:"page-frontmatter",tabindex:"-1"},[s("Page Frontmatter "),a("a",{class:"header-anchor",href:"#page-frontmatter","aria-label":'Permalink to "Page Frontmatter"'},"​")],-1),P=a("h2",{id:"more",tabindex:"-1"},[s("More "),a("a",{class:"header-anchor",href:"#more","aria-label":'Permalink to "More"'},"​")],-1),D=a("p",null,[s("Check out the documentation for the "),a("a",{href:"https://vitepress.dev/reference/runtime-api#usedata",target:"_blank",rel:"noreferrer"},"full list of runtime APIs"),s(".")],-1),w=JSON.parse('{"title":"Runtime API Examples","description":"","frontmatter":{"outline":"deep"},"headers":[],"relativePath":"api/api-examples.md","filePath":"api/api-examples.md","lastUpdated":1692014765000}'),v={name:"api/api-examples.md"},E=Object.assign(v,{setup(k){const{site:F,theme:o,page:i,frontmatter:c}=d();return(e,x)=>{var l,p;const m=f("ArticleMetadata");return r(),h("div",null,[y,(((l=e.$frontmatter)==null?void 0:l.aside)??!0)&&(((p=e.$frontmatter)==null?void 0:p.showArticleMetadata)??!0)?(r(),u(m,{key:0,article:e.$frontmatter},null,8,["article"])):b("",!0),C,a("pre",null,n(t(o)),1),_,a("pre",null,n(t(i)),1),A,a("pre",null,n(t(c)),1),P,D])}}});export{w as __pageData,E as default};

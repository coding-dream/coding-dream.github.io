$(document).ready(function() {
    get_nav_api();
});

function get_nav_api(){
    axios.get('https://ssup.cc/api/web/nav').then(function (response) {
    // handle success
    let category_list = response.data.body.results;
    let html = '';

    li_html = `
    <li>
        <a href="about.html">
            <i class="linecons-heart"></i>
            <span class="tooltip-blue">关于本站</span>
            <span class="label label-Primary pull-right hidden-collapsed">♥︎</span>
        </a>
    </li>
    `;

    for (let category of category_list) {
      li_html += `
      <li>
        <a href="#${category.name}" class="smooth">
            <i class="${category.icon}"></i>
            <span class="title">${category.name}</span>
        </a>
      </li>
      `;

      html += `<h4 class="text-gray"><i class="linecons-tag" style="margin-right: 7px;" id="${category.name}"></i>${category.name}</h4>
                <div class="row">`;
      for (let item of category["items"]) {
        html += `<div class="col-sm-3">
                    <div class="xe-widget xe-conversations box2 label-info" onclick="window.open('${item.link}', '_blank')" data-toggle="tooltip" data-placement="bottom" title="" data-original-title="${item.link}">
                        <div class="xe-comment-entry">
                            <a class="xe-user-img">
                                <img src="${item.icon}" data-src="${item.icon}" class="lozad img-circle" width="40">
                            </a>
                            <div class="xe-comment">
                                <a href="#" class="xe-user-name overflowClip_1">
                                    <strong>${item.name}</strong>
                                </a>
                                <p class="overflowClip_2">${item.content}</p>
                            </div>
                        </div>
                    </div>
                </div>`;
      }
      html += `</div><br />`;
    }
    document.getElementById('nav_list').innerHTML = html; 

    document.getElementById('main-menu').innerHTML = li_html;      
  })
  .catch(function (error) {
    // handle error
    console.log(error);
  });

}
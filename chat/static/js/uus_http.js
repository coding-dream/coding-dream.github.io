function share_question_api() {
	// 此处没有使用axios库，一般来说axios更方便，不过Fetch和axios都可以用属性访问的方式很简洁。
	fetch('/api/web/share_question')
		.then(response => response.json())
		.then(data => {
			var tagBall = document.getElementsByClassName('tagBall')[0];
			data.body.results.forEach(function(result) {
				var a = document.createElement('a');
				a.className = 'tag';
				a.href = "javascript:void(0);";
				a.textContent = result.question;
				a.onclick = function() {
					copyText(result.question);
				};

				tagBall.appendChild(a);
			});
			
		})
		.catch(error => {
			console.error('Error:', error);
		})
		.finally(() => {
			init();
			animate();
		});
}

function knowledges_api() {
	axios.get('/api/web/knowledges')
	.then(function (response) {
		let results = response.data.body.results;
		let categoriesDiv = document.getElementById('categories');
		for (let i = 0; i < results.length; i++) {
			let category = results[i];
			let items = category.items;
			let listItems = '';
			for (let j = 0; j < items.length; j++) {
				listItems += `
					<a href="article_detail.html?article_category=${items[j].article_category}&article_name=${items[j].article_name}" class="list-group-item list-group-item-action">
						<span class="item-number">${j + 1}.</span>
						<span class="item-title">${items[j].article_name}</span>
					</a>
				`;
			}
			categoriesDiv.innerHTML += `
				<h2 class="category-title">${category.name}</h2>
				<div class="d-flex justify-content-center">
					<div class="list-group w-50">
						${listItems}
					</div>
				</div>
			`;
		}
	})
	.catch(function (error) {
		console.log(error);
	});
}

// 该方法需要依赖tools_copy.js中的copyToClipboard方法
// 使用案例：<button id="copyButton" class="btn btn-info" onclick="copyPrompt(event, '{{ result.cid }}')">复制响应</button>
async function copy_prompt_api(event, cid) {
    event.stopPropagation(); // 阻止事件冒泡，不让父元素的点击事件触发
    event.preventDefault(); // 阻止默认行为
    try {
      const timestamp = Date.now();
      const formData = new URLSearchParams();
      formData.append("timestamp", timestamp);
      formData.append("cid", cid);

      // 根据 cid 发送请求以获取响应数据
      const response = await fetch(`/copy_prompt?cid=${cid}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: formData
      });

      // const text = await response.text();
      const data = await response.json();
      const prompt = data["body"]["prompt"];
      await copyToClipboard(prompt);
      toast(prompt)

    } catch (error) {
      console.error("Error fetching response:", error);
      alert("Error copying response text. " + error);
    }
  }


  function share_images_api() {
	document.getElementById('loading').style.display = 'block';
	
	axios.get('/api/web/share_images')
		.then(function (response) {
			// handle success
			let results = response.data.body.results;
			let content = '';
  
			for (let result of results) {
				content += `<h2 class="mb-4">${result.name}</h2><div class="row">`;
  
				for (let item of result.items) {
					content += `
						<div class="col-md-3 mb-4">
							<div class="card">
								<img src="${item.image}" class="card-img-top" alt="${item.prompt}">
								<div class="card-img-overlay bg-dark bg-opacity-50">
									<button class="btn btn-primary copy-btn mb-2" onclick="copyText('${item.prompt}')">prompt</button>
									<button class="btn btn-primary copy-btn" onclick="copyText('${item.negative_prompt}')">negative prompt</button>
								</div>
							</div>
						</div>
					`;
				}
  
				content += '</div>';
			}
  
			document.getElementById('content').innerHTML = content;
			document.getElementById('loading').style.display = 'none';
			document.getElementById('content').style.display = 'block';
		})
		.catch(function (error) {
			// handle error
			console.log(error);
		});
  
  }

  function share_tags_api(callback) {
	axios.get('/api/ai/image_tags')
	  .then(function (response) {
		var results = response.data.body.results;
		var container = document.querySelector('#my-container');
  
		for (var i = 0; i < results.length; i++) {
		  var result = results[i];
		  var itemsHTML = '';
  
		  for (var j = 0; j < result.items.length; j++) {
			var item = result.items[j];
			itemsHTML += `
			  <div class="col-6 col-sm-4 col-md-3 col-lg-2">
				<button class="btn btn-light mb-2 w-100 tag-button" data-name-en="${item.name_en}">
				  ${item.name_zh}
				</button>
			  </div>
			`;
		  }
  
		  var cardHTML = `
			<div class="card mt-2">
			  <div class="card-header">${result.name}</div>
			  <div class="card-body">
				<div class="row">${itemsHTML}</div>
			  </div>
			</div>
		  `;
  
		  container.innerHTML += cardHTML;
		}
	  })
	  .catch(error => {
		console.error('Error:', error);
	})
	.finally(() => {
		callback();
	});
}
  
function translateApi() {
    const inputPrompt = document.getElementById('input-prompt');
    const text = inputPrompt.value;
    const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=zh-CN&tl=en&dt=t&q=' + text;
    fetch(url)
      .then(response => response.json())
      .then(data => {
        const result = data[0][0][0];
        inputPrompt.value = result;
      });
  }

  function generateImage() {
    // Replace with your actual API endpoint
    const timestamp = Date.now();
    const apiUrl = "/api/ai/create_ai_image?timestamp=" + timestamp;

    const inputPrompt = document.getElementById('input-prompt');
    const text = inputPrompt.value;

    axios({
        method: 'post',
        url: apiUrl,
        data: {
          prompt: text,
          timestamp: timestamp
        },
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then(response => {
        if (response.status === 200) {
          const data = response.data;
          if (data["code"] == 0) {
            toast(data.body.results[0]);
			copyText(data.body.results[0]);
          } else {
            toast(data["message"]);
          }
        } else {
          toast(response.statusText);
          console.error("Failed to fetch data from API");
        }
      })
      .catch(error => {
        toast(error.message);
        console.error("Error occurred while fetching data from API:", error);
      });
  }

function randomTag() {
	// 从服务器获取随机标签
	fetch('/api/ai/random_tag')
	  .then(response => response.json())
	  .then(data => {
		if (data.code == 0) {
		  const tagText = data.body;
		  // 获取输入框元素
		  const inputPrompt = document.getElementById('input-prompt');
		  // 输出到输入框中
		  inputPrompt.value = tagText;
		} else {
		  toast(data.message);
		}
	  })
	  .catch(err => {
		toast(err.message);
		console.error('Error fetching random tag from server: ', err);
	  });
  }
  
function init_home_api() {
	axios.get('/api/ai/list')
	.then(function (response) {
	  // 这段代码使用了ES6的模板字符串（`）和箭头函数，使得代码更加简洁易读。同时，使用了map函数来遍历数组，而不是for循环，这也使得代码更加简洁。最后，使用了join函数来将数组转化为字符串。
	  const results = response.data.body.results;
	  let html = results.map(result => `
		<div class="col">
		  <a href="chat-page.html?cid=${result.cid}&title=${result.title}&content=${result.content}" class="text-decoration-none" style="color: inherit;">
			<div class="card">	
			<!-- 这里添加Badge标签 -->
			 <!-- <span class="badge bg-primary" style="width:60px;">免费</span> -->
			 <!-- <span class="badge bg-success" style="width:80px;">次卡/时间卡</span> -->
			 <!-- <span class="badge bg-warning" style="width:60px;">金币</span>-->
			  <div class="card-body text-center">
				<img src="${result.icon}" alt="" class="card-icon">
				<h5 class="card-title">${result.title}</h5>
				<p class="card-text" style="min-height:65px;">${result.content}</p>
			  </div>
			</div>
		  </a>
		</div>
	  `).join('');
	  document.querySelector('#my-container').innerHTML = html;
	})
	.catch(function (err) {
		toast(err.message);
		console.log(err);
	});
}

function get_ad_config_api() {
	axios.get('/api/web/web_ad_config')  // 假设你的API接口是'/api/config'
  .then(function (response) {
    // handle success
    var body = response.data.body;
    var html = '';
    if (body.letter_image) {
      html = `
        <div class="p-3">
          <a target="_blank" href="${body.letter_link}">
            <img src="${body.letter_image}" alt="" style="max-width: 100%; max-height: 200px;">
          </a>
        </div>
      `;
    } else {
      html = `
        <div class="bg-primary text-white p-3">
          <div class="container">
            <h4>${body.letter_title}</h4>
            <a target="_blank" href="${body.letter_link}">
              <p>${body.letter_content}</p>
            </a>
          </div>
        </div>
      `;
    }
    document.getElementById('ad-container').innerHTML = html;  // 假设你要显示的元素的id是'yourElementId'
  })
  .catch(function (error) {
    // handle error
    console.log(error);
  });
}

function share_community_api() {
	// 从服务器获取随机标签
	fetch('/api/web/share_community')
	  .then(response => response.json())
	  .then(data => {
		let content = '';
		let results = data.body.results;
		
		for (let i = 0; i < results.length; i++) {
			const result = results[i];
			content += `
				<div class="card mb-3">
					<div class="card-body">
						<img src="static/chat.png" alt="头像" class="card-img-top float-start me-3">
						<h5 class="card-title">${result.title}</h5>
						<small class="text-muted">${ result.create_time }</small>
						<div style="white-space: pre;"><p class="card-text mt-2">${ result.content}</p></div>
					</div>
				</div>
			`
		}
		document.querySelector('.timeline').innerHTML = content;

	  })
	  .catch(err => {
		toast(err.message);
		console.error('Error fetching random tag from server: ', err);
	  });
  }
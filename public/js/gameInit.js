document.addEventListener("DOMContentLoaded", function () {
    const playerId = 1;  // 默认使用第一个玩家ID

    // 控制人物属性的展示与否
    const showAttributesBtn = document.getElementById("showAttributesBtn");
    const popup = document.getElementById("popup");
    const closeBtn = document.getElementById("closeBtn");
    const attributes = document.getElementById("attributesPanel");

    // 获取玩家属性数据
    fetch(`/api/player/${playerId}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                document.getElementById('playerAttributes').innerHTML = `<div class='alert alert-danger'>${data.error}</div>`;
            } else {
                // 计算年龄
                const birthdate = new Date(data.birthdate);
                const currentDate = new Date(data.current_date);
                const ageInMilliseconds = currentDate - birthdate;
                const millisecondsInYear = 1000 * 60 * 60 * 24 * 365.25;
                const age = Math.floor(ageInMilliseconds / millisecondsInYear);

                // 显示玩家属性
                document.getElementById('playerAttributes').innerHTML = `
                    <div class="card hero-card">
                        <div class="card-body">
                            <div class="thumbnail-wrapper">
                                <img src="${data.avatar_url}" class="img-fluid rounded-circle" alt="Avatar" draggable="false" />
                            </div>
                            <h5 class="card-title">${data.name}</h5>
                            <p class="card-text"><span class="card-label">年龄</span> ${age}</p>
                            <p class="card-text"><span class="card-label">健康</span> ${data.health}</p>
                            <p class="card-text"><span class="card-label">剑术水平</span> ${data.swordsmanship}</p>
                            <p class="card-text"><span class="card-label">声望</span> ${data.good_reputation}</p>
                            <p class="card-text"><span class="card-label">城市</span> ${data.location}</p>
                            <p class="card-text site"><span class="card-label">所处位置</span><span id="currentLocation">${data.site}</span></p>
                            <div id="r18-label-wrapper"></div>
                        </div>
                    </div>
                `;
                // 检查 R18 模式设置
                fetch(`/api/game_settings/${playerId}`)
                    .then(response => response.json())
                    .then(settings => {
                        if (settings.error) {
                            document.getElementById('r18-label-wrapper').innerHTML += `<div class="alert alert-danger">${settings.error}</div>`;
                        } else if (settings.r18_mode_enabled) {
                            document.getElementById('r18-label-wrapper').innerHTML += '<p class="card-text r18-label">你已成功开启R18调试模式</p>';
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });

                // 处理点击显示属性按钮的事件
                showAttributesBtn.addEventListener('click', () => {
                    const swordsmanshipDescription = getSwordsmanshipDescription(data.swordsmanship || 0);
                    attributes.innerHTML = `
                        <strong>年龄:</strong> ${age || "无数据"}<br>
                        <strong>剑术:</strong> ${swordsmanshipDescription}<br>
                        <strong>身高:</strong> ${data.agility || "178"}cm<br>
                        <strong>相貌:</strong> ${data.agility || "面如冠玉"}<br>
                        <strong>性情:</strong> ${data.agility || "温柔缄默"}<br>
                    `;
                    popup.style.display = 'flex';
                });

                // 检查关系列表
                fetch(`/api/character_relationships`)
                    .then(response => response.json())
                    .then(relationships => {
                        if (relationships.error) {
                            document.getElementById("relationship-tab-pane").innerHTML += `<div class="alert alert-danger">${relationships.error}</div>`;
                        } else {
                            // 清空之前的内容
                            document.getElementById("relationship-tab-pane").innerHTML = `
                                <div class="relationships-wrapper">
                                    <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4"></div>
                                </div>
                            `;

                            // 获取.row容器
                            const rowContainer = document.querySelector('.relationships-wrapper .row');

                            // 遍历数组并生成每个col中的card
                            relationships.forEach(character => {
                                const colElement = document.createElement('div');
                                colElement.className = "col d-flex";
                                colElement.innerHTML = `
                                <div class="card">
                                    <div class="card-body">
                                        <h5 class="card-title">${character.name}</h5>
                                        <p class="card-text">关系类型: ${character.relationship_type}</p>
                                        <p class="card-text">好感度: <span class="approves" style="${character.relationship_type === '师徒' ? 'color: red;' : ''}">${character.approves}</span></p>
                                        <p class="card-text thoughts-on-you">${character.thoughts_on_you}</p>
                                    </div>
                                </div>
                            `;
                                // 将colElement插入到rowContainer中
                                rowContainer.appendChild(colElement);
                            });
                        }
                    })
                    .catch(error => {
                        console.error("Error:", error);
                    });

                // 关闭弹窗
                closeBtn.addEventListener("click", () => {
                    popup.style.display = 'none';
                });

                window.addEventListener("click", (event) => {
                    if (event.target === popup) {
                        popup.style.display = "none";
                    }
                });
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });


});


function getSwordsmanshipDescription(level) {
    if (level >= 90) {
        return "剑术登峰造极，出神入化";
    } else if (level >= 70) {
        return "剑术精湛，炉火纯青";
    } else if (level >= 50) {
        return "剑术高超，技艺不凡";
    } else if (level >= 30) {
        return "剑术有成，小有所成";
    } else if (level >= 10) {
        return "剑术初学，仍需努力";
    } else {
        return "毫无剑术基础";
    }
}

const locationList = document.getElementById("locationList");

locationList.addEventListener('click', (event) => {
    event.preventDefault();

    if (event.target.tagName === 'A' && event.target.classList.contains('move-location')) {
        const newLocation = event.target.textContent;

        const currentLocationElement = document.getElementById('currentLocation');
        fetch('/updateLocation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({         userId: 1, // 直接发送userId
                newLocation })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('Success:', data,'位置已更新为：' + newLocation);
                currentLocationElement.innerText = newLocation;
            })
            .catch(error => {
                console.error('Error:', error,'更新位置失败，请反馈给开发者');
            });
    }
});
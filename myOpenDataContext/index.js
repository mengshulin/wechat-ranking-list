var versionRes = compareVersion(wx.getSystemInfoSync().SDKVersion, '1.9.92');
if (versionRes >= 0) {
	var width = wx.getSystemInfoSync().screenWidth;
	var height = wx.getSystemInfoSync().screenHeight;
	var ratio = wx.getSystemInfoSync().pixelRatio;
	var sharedCanvas = wx.getSharedCanvas();
	var cvs = sharedCanvas.getContext('2d');
	var itemCanvas = wx.createCanvas();
	var ctx = itemCanvas.getContext('2d');
	var rankingStatus = false;
	var move_event = '';
	var touch_event = '';

	function initFrame(type) {
		cvs.restore();
		cvs.save();
		cvs.clearRect(0, 0, width * ratio, height * ratio);
		cvs.scale(ratio, ratio);
		var scales = width / 750 * 375 / 295;
		cvs.scale(scales, scales);
		cvs.fillStyle = '#f3b452';
		cvs.fillRect(0, 0, 750 - 160, 650);
		cvs.fillStyle = '#b03d3d';
		cvs.font = '24px Arial';
		cvs.textAlign = 'left';
		cvs.fillText(type === 1 ? '好友排行榜' : '群排行榜', 20, 40);
		cvs.fillStyle = '#f3b452';
		cvs.fillRect(0, 670, 750 - 160, 120)
	}
	function initRankingItems(items) {
		var length = items && items.length > 6 ? items.length : 6;
		var itemHeight = 590 / 6;
		itemCanvas.width = 750 - 160;
		itemCanvas.height = itemHeight * length;
		ctx.clearRect(0, 0, itemCanvas.width, itemCanvas.height);
		for (var i = 0; i < length; i++) {
			if (i % 2 === 0) {
				ctx.fillStyle = '#f0d264'
			} else {
				ctx.fillStyle = '#f3b452'
			}
			ctx.fillRect(0, i * itemHeight, 750 - 160, itemHeight)
		}
		if (items) {
			items.map((item, index) = > {
				if (item['avatarUrl'] == '' || item['avatarUrl'] == undefined) {
					item['avatarUrl'] = "images/default_head_img.png"
				}
				drawRankingNum(index, index * itemHeight);
				drawHead(item['avatarUrl'], index * itemHeight);
				drawNickName(item['nickName'], index * itemHeight);
				drawScore(item['score'], index * itemHeight)
			});
			drawRankingItems(0);
			rankingStatus = true
		}
	}
	function initOwnRanking(own) {
		if (own) {
			var rankingNum = own['ranking'];
			var image = wx.createImage();
			image.onload = () = > {
				cvs.drawImage(image, 20, 700, 60, 60)
			};
			switch (rankingNum) {
			case 0:
				image.src = 'images/first.png';
				break;
			case 1:
				image.src = 'images/second.png';
				break;
			case 2:
				image.src = 'images/third.png';
				break;
			default:
				cvs.fillStyle = '#b03d3d';
				cvs.font = 'italic 45px Arial';
				cvs.textAlign = 'center';
				cvs.fillText(rankingNum + 1, 46, 745)
			}
			var headImage = wx.createImage();
			if (own['avatarUrl'] == '' || own['avatarUrl'] == undefined) {
				own['avatarUrl'] = "images/default_head_img.png"
			}
			headImage.src = own['avatarUrl'];
			headImage.onload = () = > {
				cvs.drawImage(headImage, 100, 695, 70, 70)
			};
			cvs.fillStyle = '#b03d3d';
			cvs.font = '28px Arial';
			cvs.textAlign = 'left';
			cvs.fillText(own['nickName'], 190, 740);
			cvs.fillStyle = '#b03d3d';
			cvs.font = 'bold 36px Arial';
			cvs.textAlign = 'right';
			cvs.fillText(own['score'], 550, 742)
		}
	}
	function drawRankingNum(num, y) {
		var image = wx.createImage();
		image.onload = () = > {
			ctx.drawImage(image, 20, y + 20, 60, 60);
			drawRankingItems(0)
		};
		switch (num) {
		case 0:
			image.src = 'images/first.png';
			break;
		case 1:
			image.src = 'images/second.png';
			break;
		case 2:
			image.src = 'images/third.png';
			break;
		default:
			ctx.fillStyle = '#b03d3d';
			ctx.font = 'italic 45px Arial';
			ctx.textAlign = 'center';
			ctx.fillText(num + 1, 46, y + 62)
		}
	}
	function drawHead(url, y) {
		var image = wx.createImage();
		image.src = url;
		image.onload = () = > {
			ctx.drawImage(image, 100, y + 15, 70, 70);
			drawRankingItems(0)
		}
	}
	function drawNickName(nickName, y) {
		ctx.fillStyle = '#b03d3d';
		ctx.font = '28px Arial';
		ctx.textAlign = 'left';
		ctx.fillText(nickName, 190, y + 58)
	}
	function drawScore(score, y) {
		ctx.fillStyle = '#b03d3d';
		ctx.font = 'bold 36px Arial';
		ctx.textAlign = 'right';
		ctx.fillText(score, 550, y + 60)
	}
	function drawRankingItems(y) {
		cvs.clearRect(0, 60, 750 - 160, 590);
		cvs.fillStyle = '#f3b452';
		cvs.fillRect(0, 60, 750 - 160, 590);
		cvs.drawImage(itemCanvas, 0, y, 750 - 160, 590, 0, 60, 750 - 160, 590)
	}
	function getFriendRanking(data) {
		initFrame(1);
		wx.getFriendCloudStorage({
			keyList: [data['key']],
			success: result = > {
				if (result['data'].length !== 0) {
					var gameData = groupGameData(result['data'], data);
					initRankingItems(gameData['ranking']);
					initOwnRanking(gameData['own'])
				} else {}
			}
		})
	}
	function getGroupRanking(data) {
		initFrame(2);
		wx.getGroupCloudStorage({
			shareTicket: data['shareTicket'],
			keyList: [data['key']],
			success: result = > {
				if (result['data'].length !== 0) {
					var gameData = groupGameData(result['data'], data);
					initRankingItems(gameData['ranking']);
					initOwnRanking(gameData['own'])
				} else {}
			},
			fail: result = > {}
		})
	}
	function groupGameData(data, param) {
		var gameData = {},
			array = [],
			array_all = [];
		data.map(function(item, index) {
			if (item['KVDataList'].length !== 0) {
				array_all.push({
					openId: item['openid'],
					avatarUrl: item['avatarUrl'],
					nickName: item['nickname'].length < 8 ? item['nickname'] : `$ {
						item['nickname'].substr(0, 6)
					}...`,
					score: item['KVDataList'][0]['value']
				})
			}
		});
		array_all = sortArr(array_all);
		for (var i = 0; i < array_all.length; i++) {
			var item = array_all[i];
			if (i < 50) {
				array.push({
					openId: item['openId'],
					avatarUrl: item['avatarUrl'],
					nickName: item['nickName'].length < 8 ? item['nickName'] : `$ {
						item['nickName'].substr(0, 6)
					}...`,
					score: item['score']
				})
			}
			if (item['openId'] === param['openId']) {
				item['ranking'] = i;
				gameData['own'] = item
			}
		}
		gameData['ranking'] = array;
		return gameData
	}
	function sortArr(arr) {
		for (var i = 0; i < arr.length - 1; i++) {
			for (var j = 0; j < arr.length - 1 - i; j++) {
				if (parseInt(arr[j]['score']) < parseInt(arr[j + 1]['score'])) {
					var temp = arr[j];
					arr[j] = arr[j + 1];
					arr[j + 1] = temp
				}
			}
		}
		return arr
	}
	wx.onMessage(data = > {
		switch (data['type']) {
		case 'friend':
			getFriendRanking(data);
			event_defind();
			break;
		case 'group':
			getGroupRanking(data);
			event_defind();
			break;
		case 'clear':
			console.log("clear");
			wx.offTouchMove(move_event);
			wx.offTouchEnd(touch_event);
			break
		}
	});
	var startY = undefined,
		moveY = 0;

	function event_defind() {
		move_event = wx.onTouchMove(event = > {
			if (rankingStatus) {
				var touche = event.touches[0];
				if (startY === undefined) {
					startY = touche.clientY + moveY
				}
				moveY = startY - touche.clientY;
				drawRankingItems(moveY)
			}
		});
		touch_event = wx.onTouchEnd(event = > {
			if (rankingStatus) {
				startY = undefined;
				var touche = event.changedTouches[0];
				if (moveY < 0) {
					moveY = 0
				} else if (moveY > itemCanvas.height - 590) {
					moveY = itemCanvas.height - 590
				}
				drawRankingItems(moveY)
			}
		})
	}
}
function compareVersion(v1, v2) {
	v1 = v1.split('.');
	v2 = v2.split('.');
	var len = Math.max(v1.length, v2.length);
	while (v1.length < len) {
		v1.push('0')
	}
	while (v2.length < len) {
		v2.push('0')
	}
	for (var i = 0; i < len; i++) {
		var num1 = parseInt(v1[i]);
		var num2 = parseInt(v2[i]);
		if (num1 > num2) {
			return 1
		} else if (num1 < num2) {
			return -1
		}
	}
	return 0
}
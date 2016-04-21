var ip = document.getElementById('ipinput').value;
var port = document.getElementById('port').value;
var bitrate = document.getElementById('bitrate').value;
var fps = document.getElementById('fps').value;
var html;
var studentSection = document.getElementById('student');



//on recieve
var socketId;
// Handle the "onReceive" event.
var onReceive = function(info) {
  if (info.socketId !== socketId)
    return;
  console.log("Recieving broadcast packet...",info);
  var para = document.createElement("paper-button");
  var node = document.createTextNode("Play Stream.");
  para.appendChild(node);
  para.setAttribute("id", "playStream");
  para.setAttribute("class", "playStream");
  studentSection.appendChild(para);
  document.getElementById('playStream').onclick = startPlay;
};



//multicast
  var me = this;
  chrome.sockets.udp.create({bufferSize: 1024 * 1024}, function (createInfo) {
    var socketId = createInfo.socketId;
    var ttl = 12;
    chrome.sockets.udp.setMulticastTimeToLive(socketId, ttl, function (result) {
      if (result != 0) {
        me.handleError("Set TTL Error: ", "Unknown error");
      }
      chrome.sockets.udp.bind(socketId, "0.0.0.0", 3028, function (result) {
        if (result != 0) {
          chrome.sockets.udp.close(socketId, function () {
            me.handleError("Error on bind(): ", result);
          });
        } else {
          chrome.sockets.udp.joinGroup(socketId, "237.132.123.123", function (result) {
            if (result != 0) {
              chrome.sockets.udp.close(socketId, function () {
                me.handleError("Error on joinGroup(): ", result);
              });
            } else {
            console.log('joined group');
              me.socketId = socketId;
              chrome.sockets.udp.onReceive.addListener(onReceive);
              chrome.sockets.udp.onReceiveError.addListener(me.onReceiveError.bind(me));
              me.onConnected();
              if (callback) {
                callback.call(me);
              }
            }
          });
        }
      });
    });
  });
// Create the Socket
// chrome.sockets.udp.create({}, function(socketInfo) {
// socketId=socketInfo.socketId;
// console.log("Socket Created:" + socketInfo.socketId);
// chrome.sockets.udp.bind(socketInfo.socketId,"0.0.0.0",8000,
// function(){
// chrome.sockets.udp.setBroadcast(socketInfo.socketId,true,
// function(result){
// if (result === 0){
// 			console.log("Ready to receive braodcast UDP traffic");
// 		}
// 	});
// });
// 
// chrome.sockets.udp.onReceive.addListener(onReceive);
// });




document.getElementById('startCamSharing').addEventListener('click', function() {
    console.log("clicked");
  // The socket is created, now we can send some data 
  		chrome.sockets.udp.send(socketId, str2ab(ip+','+port),
    	'237.132.123.123', 3028, function(sendInfo) {
      	 console.log("sent " + sendInfo.bytesSent);
    });
});

function str2ab(str) {
  var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
  var bufView = new Uint16Array(buf);
  for (var i=0, strLen=str.length; i<strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

function startPlay() {

  var options = getOptions();
  saveOptions(options);

  nms.startPlayer(options).then(function() {
    document.getElementById('playStream').innerText = 'Stop stream';
    document.getElementById('playStream').onclick = stopStreamReceiver;
  });

  // Resize the NaCl module when stream playing is started
  var moduleEl = document.getElementById('nacl_module');
  moduleEl.setAttribute('width', 640);
  moduleEl.setAttribute('height', 340);
}

function getOptions() {
    var ip = document.getElementById('ipinput').value;
    var port = document.getElementById('port').value;
    var bitrate = document.getElementById('bitrate').value;
    var fps = document.getElementById('fps').value;

    return {
      ip: ip,
      port: port,
      bitrate: bitrate,
      fps: fps,
    }
}


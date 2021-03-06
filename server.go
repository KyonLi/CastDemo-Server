// Copyright 2019 Kyon Li. All rights reserved.
// Use of this source code is governed by a BSD-style

package main

import (
	"fmt"
	"github.com/gorilla/websocket"
	"log"
	"net/http"
	"os"
	"os/exec"
	"os/signal"
	"path/filepath"
	"strings"
	"syscall"
)

// 信息结构体
type Msg struct {
	Cmd      int             `json:"cmd,omitempty"` // 1允许评论 2禁评
	Name     string          `json:"name,omitempty"`
	Text     string          `json:"text,omitempty"`
	Biaoqing string          `json:"bq,omitempty"`
	Image    string          `json:"image,omitempty"`
	Room     string          `json:"room,omitempty"`
	Owner    bool            `json:"owner"`
	Sender   *websocket.Conn `json:"-"`
}

var clients = make(map[*websocket.Conn]string) // 已连接客户端
var msgHistory = make([]Msg, 0)                // 消息历史
var broadcast = make(chan Msg)                 // 待发送消息队列
var cmdList = make(map[string]Msg)             // 房间指令

// 配置upgrader
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func handleConnections(w http.ResponseWriter, r *http.Request) {
	vars := r.URL.Query()
	room := vars["room"]
	if len(room) == 0 {
		// 没有房间号
		log.Print("error: no room number")
		return
	}

	// GET请求升级到websocket
	c, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Print("upgrade:", err)
		return
	}
	// 客户端连接保存到clients
	clients[c] = room[0]
	// 发送历史消息
	sendAllMsg(c)
	// 开始接收消息
	readMessage(c)
}

func readMessage(c *websocket.Conn) {
	defer func() {
		delete(clients, c)
		c.Close()
	}()

	for {
		var msg Msg
		// 读取JSON格式消息并转换为Msg
		err := c.ReadJSON(&msg)
		if err != nil {
			log.Println(err)
			break
		}
		msg.Sender = c
		// 检查消息类型
		if msg.Cmd == 0 {
			// 普通消息
			msgHistory = append(msgHistory, msg)
		} else {
			// 指令消息
			cmdList[msg.Room] = msg
		}
		broadcast <- msg
	}
}

func handleMessages() {
	// 从消息队列取出Msg
	for msg := range broadcast {
		from := msg.Room
		for client := range clients {
			to := clients[client]
			if msg.Sender != client && from == to {
				err := client.WriteJSON(msg)
				if err != nil {
					log.Printf("error: %v", err)
					client.Close()
					delete(clients, client)
				}
			}
		}
	}
}

// 发送所有历史消息
func sendAllMsg(c *websocket.Conn) {
	to := clients[c]
	// 发送房间指令
	msg, ok := cmdList[to]
	if ok {
		c.WriteJSON(msg)
	}

	// 发送历史消息
	for _, msg := range msgHistory {
		from := msg.Room
		if to == from {
			c.WriteJSON(msg)
		}
	}
}

func closeAll() {
	for c := range clients {
		c.Close()
	}
	close(broadcast)
}

func startHttpServer() *http.Server {
	srv := &http.Server{Addr: ":7080"}

	http.HandleFunc("/ws", handleConnections)
	//http.Handle("/chat/", http.StripPrefix("/chat/", http.FileServer(http.Dir(fmt.Sprintf("%s/public", getCurrPath())))))
	http.Handle("/", http.FileServer(http.Dir(fmt.Sprintf("%s/public", getCurrPath()))))
	go func() {
		// returns ErrServerClosed on graceful close
		if err := srv.ListenAndServe(); err != http.ErrServerClosed {
			// NOTE: there is a chance that next line won't have time to run,
			// as main() doesn't wait for this goroutine to stop. don't use
			// code with race conditions like these for production. see post
			// comments below on more discussion on how to handle this.
			log.Fatalf("ListenAndServe(): %s", err)
		}
	}()

	// returning reference so caller can call Shutdown()
	return srv
}

// 获取可执行文件所在目录绝对路径
func getCurrPath() string {
	file, _ := exec.LookPath(os.Args[0])
	path, _ := filepath.Abs(file)
	index := strings.LastIndex(path, string(os.PathSeparator))
	ret := path[:index]
	return ret
}

func main() {
	// 启动websocket服务器
	log.SetFlags(0)
	go handleMessages()
	srv := startHttpServer()

	{
		osSignals := make(chan os.Signal, 1)
		signal.Notify(osSignals, os.Interrupt, os.Kill, syscall.SIGTERM)
		<-osSignals

		closeAll()
		if err := srv.Shutdown(nil); err != nil {
			panic(err) // failure/timeout shutting down the server gracefully
		}
		os.Exit(0)
	}
}

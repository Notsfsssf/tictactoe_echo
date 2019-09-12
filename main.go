package main

import (
	"container/list"
	"fmt"
	"github.com/gorilla/websocket"
	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"
	"net/http"
	"time"
)

type Step struct {
	Position int  `json:"position"`
	Iso      bool `json:"iso"`
}
type WaitName struct {
	Index int    `json:"index"`
	Id    string `json:"id"`
}

var clients = make(map[*websocket.Conn]int)
var players = make(map[*websocket.Conn]int)

var broadcast = make(chan Step)
var squares = make(map[int]bool)
var (
	upgrader = websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			return true
		},
	}
)

//[0, 1, 2],
//[3, 4, 5],
//[6, 7, 8],
//[0, 3, 6],
//[1, 4, 7],
//[2, 5, 8],
//[0, 4, 8],
//[2, 4, 6]
func caculateWinner() bool {
	lines := list.New()
	lines.PushBack([]int{0, 1, 2})
	lines.PushBack([]int{3, 4, 5})
	lines.PushBack([]int{6, 7, 8})
	lines.PushBack([]int{0, 3, 6})
	lines.PushBack([]int{1, 4, 7})
	lines.PushBack([]int{2, 5, 8})
	lines.PushBack([]int{0, 4, 8})
	lines.PushBack([]int{2, 4, 6})
	for item := lines.Front(); item != nil; item = item.Next() {
		a := item.Value.([]int)[0]
		b := item.Value.([]int)[1]
		c := item.Value.([]int)[2]
		_, ok := squares[a]
		_, ok = squares[b]
		_, ok = squares[c]
		if ok && squares[a] == squares[b] && squares[a] == squares[c] {
			return true
		}

	}
	return false
}
//向所有玩家传递信息变化
func handleMessages() {
	for {
		msg := <-broadcast
		squares[msg.Position] = msg.Iso
		if caculateWinner() {
			for client := range players {
					client.Close()
					delete(clients, client)
			}
			squares= make(map[int]bool)
		}
		for client := range players {
			err := client.WriteJSON(msg)
			if err != nil {
				client.Close()
				delete(clients, client)
			}
		}
	}

}

var num = 1
//开始下棋
func hello(c echo.Context) error {
	ws, err := upgrader.Upgrade(c.Response(), c.Request(), nil)
	if err != nil {
		return err
	}
	players[ws] = 0
	fmt.Println(num)
	num++
	defer func() {
		ws.Close()
		delete(clients, ws)
	}()
	for {
		step := Step{}
		err := ws.ReadJSON(&step)
		if err != nil {
			c.Logger().Error(err)
			break
		} else {
			broadcast <- step
		}
	}
	return nil
}

var intName = 1
var id = time.Now().String()
//等待玩家
func handleName(c echo.Context) error {
	name := c.Param("name")
	fmt.Println(name)
	ws, err := upgrader.Upgrade(c.Response(), c.Request(), nil)
	if err != nil {
		return err
	}
	defer func() {
		ws.Close()
		delete(clients, ws)
	}()
	clients[ws] = intName
	if intName%2 != 0 {
		id = time.Now().String()
	}
	intName++
	for {
		if len(clients) == 2 {
			err := ws.WriteJSON(WaitName{
				Index: clients[ws],
				Id:    id,
			})
			if err != nil {
				c.Logger().Error(err)

			}
			break
		}
	}
	return nil
}
func main() {
	e := echo.New()
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.GET("/name/:name", handleName)
	//e.Static("/", "./ticacoe/build") //react静态文件
	e.GET("/ws/:id", hello)
	go handleMessages()
	e.Logger.Fatal(e.Start(":1323"))

}

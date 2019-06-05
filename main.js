let moveUp;
const width = window.innerWidth;
const height = window.innerHeight;
const countFloor = 10;
const elevatorCapacity = 4;
let arrayOfPeople = [];
for (let i = 0; i < countFloor + 1; i++) {
    arrayOfPeople.push([]);
}
let arrayElevator = [];
let elevatorFloor = 1;
let app = new PIXI.Application(width, height, {
    backgroundColor: 0xFFFFFF,
    antialias: true,
    transparent: false,
    resolution: 1
});
document.body.appendChild(app.view);
function animate() {
    requestAnimationFrame(animate);
    TWEEN.update();
}
class People {
    constructor(floorCreating, floorDestination) {
        this.floorCreating = floorCreating;
        this.floorDestination = floorDestination;
        this.moveUp = floorCreating < floorDestination;
        let rectangle = new PIXI.Graphics();
        if (this.moveUp) {
            rectangle.lineStyle(4, 0x0000FF, 1);
        }
        else {
            rectangle.lineStyle(4, 0x00FF00, 1);
        }
        let text = new PIXI.Text(floorDestination.toString(), { fontSize: 30, fill: 0x000 });
        text.position.x = width - 240;
        text.position.y = height - ((height - 100) / countFloor * (floorCreating - 1)) - 105;
        rectangle.drawRect(0, 0, 40, 45);
        rectangle.x = width - 240;
        rectangle.y = height - ((height - 100) / countFloor * (floorCreating - 1)) - 105;
        app.stage.addChild(rectangle);
        app.stage.addChild(text);
        this.target = rectangle;
        this.targetText = text;
    }
    MoveHorizontal(moveTo, timeAnimation, callback = null) {
        let target = this.target;
        let targetText = this.targetText;
        let elem = { x: this.target.position.x, target: this.target, targetText: this.targetText };
        let updateCallback = function (object) {
            object.target.position.x = object.x;
            object.targetText.position.x = object.x;
        };
        let peopleTween = new TWEEN.Tween(elem)
            .to({ x: moveTo }, timeAnimation)
            .delay(0)
            .onUpdate(updateCallback)
            .easing(TWEEN.Easing.Linear.None)
            .start();
        peopleTween.onComplete(function () {
            if (callback !== null) {
                callback(target, targetText);
            }
            peopleTween.stop();
        });
        animate();
    }
    static Delete(target, targetText) {
        target.destroy();
        targetText.destroy();
    }
    static MoveVertical(moveUp) {
        for (let i = 0; i < arrayElevator.length; i++) {
            let elem = { y: arrayElevator[i].target.position.y, target: arrayElevator[i].target, targetText: arrayElevator[i].targetText };
            let updateCallback = function (object) {
                object.target.position.y = object.y;
                object.targetText.position.y = object.y;
            };
            new TWEEN.Tween(elem)
                .to({ y: arrayElevator[i].target.position.y - (height - 100) / countFloor * moveUp }, 1000)
                .delay(0)
                .onUpdate(updateCallback)
                .easing(TWEEN.Easing.Linear.None)
                .start();
            animate();
        }
    }
    MoveInElevator(position) {
        this.MoveHorizontal(65 + ((arrayElevator.length - 1) * 45), 800);
        arrayOfPeople[this.floorCreating].splice(position, 1);
    }
    MoveOutOfElevator() {
        this.MoveHorizontal(this.target.position.x + width - 240, 3500, People.Delete);
    }
}
class Elevator {
    static Create() {
        let rectangle = new PIXI.Graphics();
        rectangle.lineStyle(4, 0x00FFFF, 1);
        rectangle.drawRect(0, 0, 180, ((height - 100) / countFloor) - 5);
        rectangle.x = 60;
        rectangle.y = height - ((height - 100) / countFloor) - 50;
        let line = new PIXI.Graphics();
        line.lineStyle(4, 0xFFFFFF, 1);
        line.moveTo(240, (height - 100) / countFloor - 15);
        line.lineTo(240, 0);
        line.y = height - ((height - 100) / countFloor) - 45;
        app.stage.addChild(rectangle);
        app.stage.addChild(line);
        this.elevator = rectangle;
        this.elevatorDoor = line;
    }
    static Logic() {
        let elevatorStop = false;
        for (let i = 0; i < arrayElevator.length; i++) {
            if (arrayElevator[i].floorDestination === elevatorFloor) {
                arrayElevator[i].MoveOutOfElevator();
                arrayElevator.splice(i, 1);
                i--;
                elevatorStop = true;
            }
        }
        for (let i = 0; i < arrayElevator.length; i++) {
            arrayElevator[i].MoveHorizontal(65 + i * 45, 500);
        }
        if (elevatorFloor === countFloor) {
            moveUp = false;
        }
        else if (elevatorFloor === 1) {
            moveUp = true;
        }
        if (arrayOfPeople[elevatorFloor].length > 0 && arrayElevator.length < elevatorCapacity) {
            for (let i = 0; i < arrayOfPeople[elevatorFloor].length; i++) {
                if (arrayElevator.length === 0) {
                    moveUp = arrayOfPeople[elevatorFloor][i].moveUp;
                }
                if (arrayElevator.length < elevatorCapacity && moveUp === arrayOfPeople[elevatorFloor][i].moveUp) {
                    arrayElevator.push(arrayOfPeople[elevatorFloor][i]);
                    arrayOfPeople[elevatorFloor][i].MoveInElevator(i);
                    elevatorStop = true;
                    i--;
                }
            }
            for (let i = 0; i < arrayOfPeople[elevatorFloor].length; i++) {
                arrayOfPeople[elevatorFloor][i].MoveHorizontal(260 + i * 50, 500);
            }
        }
        if (elevatorStop) {
            setTimeout(function () {
                moveUp ? Elevator.Move(1) : Elevator.Move(-1);
            }, 800);
        }
        else {
            moveUp ? Elevator.Move(1) : Elevator.Move(-1);
        }
    }
    static Move(moveUp) {
        let elemElevator = { y: this.elevator.position.y, target: this.elevator };
        let updateCallback = function (object) {
            object.target.position.y = object.y;
            Elevator.elevatorDoor.position.y = object.y + 5;
        };
        let tween = new TWEEN.Tween(elemElevator)
            .to({ y: this.elevator.position.y - (height - 100) / countFloor * moveUp }, 1000)
            .delay(0)
            .onUpdate(updateCallback)
            .easing(TWEEN.Easing.Linear.None)
            .start();
        People.MoveVertical(moveUp);
        tween.onComplete(function () {
            tween.stop();
            elevatorFloor += moveUp;
            Elevator.Logic();
        });
        animate();
    }
}
class Main {
    static Setup() {
        let rectangle = new PIXI.Graphics();
        rectangle.lineStyle(4, 0x000, 1);
        rectangle.drawRect(0, 0, width - 100, height - 100);
        rectangle.x = 50;
        rectangle.y = 50;
        app.stage.addChild(rectangle);
        for (let i = 1; i < countFloor + 1; i++) {
            let line = new PIXI.Graphics();
            line.lineStyle(4, 0x000, 1);
            line.moveTo(250, height - ((height - 100) / countFloor * i) - 50);
            line.lineTo(width - 50, height - ((height - 100) / countFloor * i) - 50);
            let text = new PIXI.Text('Level ' + i, { fontSize: 30, fill: 0x000 });
            text.position.x = width - 180;
            text.position.y = height - ((height - 100) / countFloor * i) - 35;
            app.stage.addChild(line);
            app.stage.addChild(text);
        }
        Elevator.Create();
        Elevator.Logic();
        Main.InfinityCreatePeopleOnEveryFloor();
    }
    static InfinityCreatePeopleOnEveryFloor() {
        for (let i = 1; i < countFloor + 1; i++) {
            Main.InfinityCreatePeople(i);
        }
    }
    static InfinityCreatePeople(floor) {
        setTimeout(function () {
            let floorDestination = Math.floor(Math.random() * (countFloor) + 1);
            while (floor === floorDestination) {
                floorDestination = Math.floor(Math.random() * (countFloor) + 1);
            }
            let people = new People(floor, floorDestination);
            function PushPeopleCallback() {
                arrayOfPeople[floor].push(people);
                setTimeout(function () {
                    people.MoveHorizontal(260 + (arrayOfPeople[floor].length - 1) * 50, 500);
                }, 100);
            }
            people.MoveHorizontal(260 + arrayOfPeople[floor].length * 50, 3500, PushPeopleCallback);
            Main.InfinityCreatePeople(floor);
        }, Math.floor(Math.random() * 6000 + 4000));
    }
}
PIXI.loader
    .load(Main.Setup);

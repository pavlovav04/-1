// определение необходимых переменных
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext('2d');
var dragging = false;
var pos = { x: 0, y: 0 };

// определение слушателей событий для настольных и мобильных устройств

// не сенсорное устройство
canvas.addEventListener('mousedown', engage);
canvas.addEventListener('mousedown', setPosition);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', disengage);

// сенсорное устройство
canvas.addEventListener('touchstart', engage);
canvas.addEventListener('touchmove', setPosition);
canvas.addEventListener('touchmove', draw);
canvas.addEventListener('touchend', disengage);

// определение, является ли устройство сенсорным
function isTouchDevice() {
  return (
    ('ontouchstart' in window) || 
    (navigator.maxTouchPoints > 0) || 
    (navigator.msMaxTouchPoints > 0)
  );
}

// определение основных функций для обнаружения нажатий / отпусканий

function engage() {
  dragging = true;
};

function disengage() {
  dragging = false;
};

// получение новой позиции в зависимости от события мыши / касания
function setPosition(e) {
  if (isTouchDevice()) {
    var touch = e.touches[0];
    pos.x = touch.clientX - ctx.canvas.offsetLeft;
    pos.y = touch.clientY - ctx.canvas.offsetTop;
  } else {
    pos.x = e.clientX - ctx.canvas.offsetLeft;
    pos.y = e.clientY - ctx.canvas.offsetTop;
  }
}

// рисование линии на холсте, если мышь нажата
function draw(e) {
  e.preventDefault();
  e.stopPropagation();

  // для рисования пользователь должен быть вовлечён (dragging = true)
  if (dragging) {
    // начать рисование
    ctx.beginPath();
  
    // атрибуты линии
    ctx.lineWidth = 20;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'red';

    // получить текущую позицию, перейти к новой позиции, создать линию от текущей к новой
    ctx.moveTo(pos.x, pos.y);
    setPosition(e);
    ctx.lineTo(pos.x, pos.y);

    // нарисовать
    ctx.stroke();
  }
}

// очистка холста
function erase() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// определение функции загрузки модели TF
async function loadModel(){  
  // загрузка модели
  model = await tf.loadLayersModel('tensorflow/model.json');    
  
  // прогрев модели. ускоряет первое предсказание
  model.predict(tf.zeros([1, 28, 28, 1]));
  
  // вернуть модель
  return model;
}

// получение тензора изображения с холста
function getData(){
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

// определение функции вывода модели
async function predictModel(){
  // получение данных изображения
  imageData = getData();
  
  // преобразование из объекта данных холста в тензор
  image = tf.browser.fromPixels(imageData);
  
  // предварительная обработка изображения
  image = tf.image.resizeBilinear(image, [28,28]).sum(2).expandDims(0).expandDims(-1);
  
  // получение предсказания модели
  y = model.predict(image);
  
  // замена текста в элементе результата на предсказание модели
  document.getElementById('result').innerHTML = "Предсказание: " + y.argMax(1).dataSync();
}

// загрузка модели
var model = loadModel();

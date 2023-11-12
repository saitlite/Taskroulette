var names = JSON.parse(localStorage.getItem('names')) || []; 
var confirmEditButton = document.getElementById('confirmEdit'); //編集確定ボタン
var selected; // 選択されているリストアイテムを保存するための変数

var nameCounts = JSON.parse(localStorage.getItem('nameCounts')) || {};
for (var i = 0; i < names.length; i++) {
    if (!nameCounts.hasOwnProperty(names[i])) {
        nameCounts[names[i]] = 1; // 新たに追加された名前の初期カウントを1に設定
    }
}

//スロットマシン系
var isSpinning = false; // スピン中かどうかを表すフラグ
var spinInterval; // スピンのインターバルを管理するための変数


document.addEventListener('DOMContentLoaded', function() {
    updateNameList(); 
});

//スロットスタート
document.getElementById('spin').addEventListener('click', function() {
    
  if(!isSpinning){
    spinInterval = setInterval(function(){
    var index1 = Math.floor(Math.random() * names.length);
    var index2 = Math.floor(Math.random() * names.length);
    var index3 = Math.floor(Math.random() * names.length);

    var slot1 = names[index1];
    var slot2 = names[index2];
    var slot3 = names[index3];

    document.getElementById('slot1').innerText = slot1;
    document.getElementById('slot2').innerText = slot2;
    document.getElementById('slot3').innerText = slot3;
  },100);

  isSpinning = true;
}else{
    clearInterval(spinInterval);
    isSpinning = false;
    
    var index = Math.floor(Math.random() * names.length); // 一致させるために新たにランダムインデックスを生成
    var selectedName = names[index]; 
    
    var selectedName = biasedRandom();
    
    document.getElementById('slot1').innerText = selectedName;
    document.getElementById('slot2').innerText = selectedName;
    document.getElementById('slot3').innerText = selectedName;

    setTimeout(function() {
        alert('Congratulations! ' + selectedName + ' is selected!');
        nameCounts[selectedName]++; // 選ばれた名前のカウントを増やす
        updateNameList();
        localStorage.setItem('nameCounts', JSON.stringify(nameCounts));
    }, 150);
  }
});

//確率操作
function biasedRandom() {
    var total = 0;
    var shuffledNames = [...names];
    shuffledNames.sort(() => Math.random() - 0.5); // 名前の配列をシャッフル

    for (var name of shuffledNames) {
        total += 1 / Math.pow(nameCounts[name],2); // 選ばれた回数の逆数を合計の2乗に加える
    }
    var threshold = Math.random() * total; // 閾値をランダムに設定
    total = 0;
    
    for (var name of shuffledNames) {
        total += 1 / nameCounts[name];
        if (total >= threshold) {
            return name; // 閾値を超えた最初の名前を選択
        }
    }
}

// 名前リストを更新する関数
function updateNameList() {
    var nameList = document.getElementById('nameList');
    var nameInput = document.getElementById('nameInput');
    // 既存のリストをクリア
    nameList.innerHTML = '';
    // 現在の名前でリストを作成
    for (var i = 0; i < names.length; i++) {
        var li = document.createElement('li');
        var nameTextNode = document.createTextNode(names[i]);
        var countTextNode = document.createTextNode(' 回数: ' + nameCounts[names[i]]);
        // 合計カウントの逆数を算出
        var totalInverseCount = 0;
        for (var key in nameCounts) {
          totalInverseCount += 1 / nameCounts[key];
        }

        // 各名前のカウントの逆数をパーセンテージに変換
        var percentage = Math.round((1 / nameCounts[names[i]] / totalInverseCount) * 100);
        var percentageTextNode = document.createTextNode(' 確率: ' + percentage + '%');
        //プラスボタン
        var increaseButton = document.createElement('button');
        increaseButton.textContent = '+';
        //マイナスボタン
        var decreaseButton = document.createElement('button');
        decreaseButton.textContent = '-';
        // カウントを増やすボタンがクリックされた時の処理
        increaseButton.addEventListener('click', function() {
            var name = this.parentNode.firstChild.textContent;
            nameCounts[name]++;
            updateNameList();
            localStorage.setItem('nameCounts', JSON.stringify(nameCounts));
        });
        // カウントを減らすボタンがクリックされた時の処理
        decreaseButton.addEventListener('click', function() {
            var name = this.parentNode.firstChild.textContent;
            if (nameCounts[name] > 1) { // カウントは最低1でなければならない
                nameCounts[name]--;
                updateNameList();
                localStorage.setItem('nameCounts', JSON.stringify(nameCounts));
            }
        });
        var editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        var deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        // 編集ボタンがクリックされた時に名前をテキストエリアに表示
        editButton.addEventListener('click', function() {
            selected = this.parentNode; // 選択されているリストアイテムを保存
            nameInput.value = this.parentNode.firstChild.textContent;
            confirmEditButton.style.display = 'inline'; 
        });
        // 削除ボタンがクリックされた時に名前を削除
        deleteButton.addEventListener('click', function() {
            var name = this.parentNode.firstChild.textContent;
            var index = names.indexOf(name);
            if (index !== -1) {
                names.splice(index, 1);
                updateNameList(); // リストを更新
                localStorage.setItem('names', JSON.stringify(names)); //情報を保存
            }
        });
        //カウンター±ボタン
        li.appendChild(nameTextNode);
        li.appendChild(countTextNode);
        li.appendChild(percentageTextNode);
        li.appendChild(increaseButton);
        li.appendChild(decreaseButton);
        //編集、削除ボタン
        li.appendChild(editButton);
        li.appendChild(deleteButton);
        nameList.appendChild(li);
    }
}

//確定ボタンがクリックされた時に名前を更新
confirmEditButton.addEventListener('click', function() {
    var newName = nameInput.value;
    if (selected && newName !== '') {
        var oldName = selected.firstChild.textContent;
        var index = names.indexOf(oldName);
        if (index !== -1) {
            names[index] = newName;
            selected.firstChild.textContent = newName; // 選択されているリストアイテムを更新
            nameInput.value = '';
            localStorage.setItem('names', JSON.stringify(names)); 
        }
    }
    this.style.display = 'none'; 
});

//名前を追加
document.getElementById('addName').addEventListener('click', function() {
    var nameInput = document.getElementById('nameInput');
    var name = nameInput.value;
    if (name !== '') {
        names.push(name);[]
        nameCounts[name] = 1;
        nameInput.value = '';
        updateNameList();
        localStorage.setItem('names', JSON.stringify(names)); //情報を保存
    }
});

//名前を削除
document.getElementById('removeName').addEventListener('click', function() {
    var nameInput = document.getElementById('nameInput');
    var name = nameInput.value;
    var index = names.indexOf(name);
    if (index !== -1) {
        names.splice(index, 1);
        delete nameCounts[name];
        nameInput.value = '';
        updateNameList();
        localStorage.setItem('names', JSON.stringify(names)); //情報を保存
    }
});


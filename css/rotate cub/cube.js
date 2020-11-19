var cube = document.querySelector('.cube');
var radioGroup = document.querySelector('.radio-group');
var rightSite = document.querySelector('.cube__side--right');
var currentClass = '';

rightSite.onclick = function () {
    var rightClick = document.querySelector("[name='rotate-cube-side'][value='right'")
    rightClick.checked = true;
    changeSide()
}

function changeSide() {
    var radioItems = document.getElementsByName('rotate-cube-side');
    var radioValue
    radioItems.forEach(item => {
        if (item.checked) radioValue = item.value;
    })

    var showClass = `show-${radioValue}`

    if (currentClass) {
        cube.classList.remove(currentClass);
    }
    cube.classList.add(showClass);
    document.getElementById(radioValue).classList.add(showClass)
    currentClass = showClass;
}
// set initial side
changeSide();

radioGroup.addEventListener('change', changeSide);
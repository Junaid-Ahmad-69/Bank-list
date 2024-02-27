'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
    owner: 'Jonas Schmedtmann',
    movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
    interestRate: 1.2, // %
    pin: 1111,
};

const account2 = {
    owner: 'Jessica Davis',
    movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
    interestRate: 1.5,
    pin: 2222,
};

const account3 = {
    owner: 'Steven Thomas Williams',
    movements: [200, -200, 340, -300, -20, 50, 400, -460],
    interestRate: 0.7,
    pin: 3333,
};

const account4 = {
    owner: 'Sarah Smith',
    movements: [430, 1000, 700, 50, 90],
    interestRate: 1,
    pin: 4444,
};

const accounts = [account1, account2, account3, account4];
const overallBalance = accounts.map((move) => move.movements)
console.log(overallBalance.flat().filter((data) => data > 0).reduce((acc, move) => acc + move, 0));
// Elements
const labelWelcome = document.querySelector('.welcome'),
    labelDate = document.querySelector('.date'),
    labelBalance = document.querySelector('.balance__value'),
    labelSumIn = document.querySelector('.summary__value--in'),
    labelSumOut = document.querySelector('.summary__value--out'),
    labelSumInterest = document.querySelector('.summary__value--interest'),
    labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn'),
    btnTransfer = document.querySelector('.form__btn--transfer'),
    btnLoan = document.querySelector('.form__btn--loan'),
    btnClose = document.querySelector('.form__btn--close'),
    btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user'),
    inputLoginPin = document.querySelector('.login__input--pin'),
    inputTransferTo = document.querySelector('.form__input--to'),
    inputTransferAmount = document.querySelector('.form__input--amount'),
    inputLoanAmount = document.querySelector('.form__input--loan-amount'),
    inputCloseUsername = document.querySelector('.form__input--user'),
    inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

const currencies = new Map([
    ['USD', 'United States dollar'],
    ['EUR', 'Euro'],
    ['GBP', 'Pound sterling'],
]);

// const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];


const displayMovements = (data, sort = false) => {
    containerMovements.innerHTML = ""

    const sortMoves = sort ? data.movements.slice().sort((a, b) => a - b) : data.movements;
    sortMoves.forEach((mov, i) => {
        const type = mov > 0 ? "deposit" : "withdrawal"
        const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
      <div class="movements__value">${mov}$</div>
    </div>
        `
        containerMovements.insertAdjacentHTML("afterbegin", html)
    })
}


/*******************************
 Show Current Balance
 ********************************/
const calcDisplayBalance = (acc) => {
    acc.balance = acc.movements.reduce((acc, cur) => acc + cur, 0)
    labelBalance.textContent = acc.balance
}


/********************
 Show Incoming Money
 ********************/

const calcDisplaySummary = (acc) => {
    // Total Deposit
    const sumIn = acc.movements.filter(move => move > 0)
        .reduce((acc, cur) => acc + cur, 0)
    labelSumIn.textContent = `${sumIn} 💲`

    // Total WithDrawl
    const sumOut = acc.movements.filter(move => move < 0)
        .reduce((acc, cur) => acc + cur, 0)
    labelSumOut.textContent = `${Math.abs(sumOut)} 💲`

    // Total Interest
    const totalInterest = acc.movements.filter(move => move > 0)
        .map((deposit) => (deposit * acc.interestRate) / 100)
        .filter((int) => int >= 1)
        .reduce((acc, cur) => acc + cur, 0)
    labelSumInterest.textContent = `${totalInterest} 💲`
}


/*****************************************
 Add username property in accounts objects
 ****************************************/


const createUserNames = (account) => account.forEach((acc) => acc.username = acc.owner.toLowerCase().split(' ').map(name => name[0]).join(''));
createUserNames(accounts)


/***********************************************
 Update the UI after login & Transfer & loan
 ***********************************************/

const updateUI = function () {
    displayMovements(currentAccount)
    calcDisplayBalance(currentAccount)
    calcDisplaySummary(currentAccount)
}


/**********************************
 Implement the Login Functionality
 **********************************/
let currentAccount;
btnLogin.addEventListener("click", function (e) {
    e.preventDefault();
    currentAccount = accounts.find((acc) => acc.username === inputLoginUsername.value)
    if (currentAccount && currentAccount?.pin === +(inputLoginPin.value)) {
        labelWelcome.textContent = `Welcome back ${currentAccount.owner.split(" ")[0]}`
        containerApp.style.opacity = "100";
        inputLoginUsername.value = inputLoginPin.value = ""
        inputLoginPin.blur();
    }
    updateUI();

});


/*******************************
 Transfer Money
 ********************************/

btnTransfer.addEventListener("click", function (e) {
    e.preventDefault();
    const amount = +(inputTransferAmount.value);
    const receiverAcc = accounts.find((acc) => acc.username === inputTransferTo.value);
    if (amount > 0 && currentAccount.balance >= amount && receiverAcc && receiverAcc?.username !== currentAccount.username) {
        currentAccount.movements.push(-amount);
        receiverAcc.movements.push(amount);
        inputTransferAmount.value = inputTransferTo.value = "";
        updateUI()
    }
})


/*************
 Close Account
 *************/
btnClose.addEventListener("click", function (e) {
    e.preventDefault();
    const closeUser = inputCloseUsername.value;
    const closePin = +(inputClosePin.value);
    if (closeUser === currentAccount.username && closePin === currentAccount.pin) {
        const index = accounts.findIndex((acc) => acc.username === currentAccount.username)
        // Delete account
        accounts.splice(index, 1)
        containerApp.style.opacity = "0"

    }
    inputCloseUsername.value = inputClosePin.value = ""

});

/*************
 Loan Amount
 *************/
btnLoan.addEventListener("click", function (e) {
    e.preventDefault();
    const amount = +(inputLoanAmount.value);
    if (amount > 0 && currentAccount.movements.some(move => move >= amount * 0.1)) {
        // Add Movement
        currentAccount.movements.push(amount)

        updateUI(currentAccount)
    }
    inputLoanAmount.value = "";

})

/*************
 Sort The data
 *************/
let sorted = false
btnSort.addEventListener("click", function (e) {
    e.preventDefault()
    displayMovements(currentAccount, !sorted)
    sorted = !sorted;
});


/*******************************
 Get array data with array data
 ********************************/
// const moveData = [200, 3000, -4000, 90, 500, -2100]
// const moveDescription = moveData.map((item, i) => `Movement ${i + 1}: You ${item > 0 ? 'deposited' : 'withdrawl'} ${Math.abs(item)}}`
// )
// console.log(moveDescription)


// Difference Between Find and Filter
// The filter return all the data that match to specific condition
// where the find return the single and first result which  match to specific condition

// const accountss = accounts.find(acc => acc.username === "jd")
// console.log(accountss)
//
// for (const accountss of accounts){
//     if(accountss.username === "jd"){
//         console.log(accountss)
//     }
// }

/*******************************
 Fix maximum value in array
 ********************************/

// const maxValue = movements.reduce((acc, cur) => {
//     if (acc > cur) return acc
//     else return cur
// }, movements[0])
//
// console.log(maxValue)


const userData = ["john", "wick", "jack", "panther", "old man", "snake "]
const topMovies = new Array(5);

// for (let i = 0; i <= topMovies.length; i++) {
//     topMovies.fill(userData[i])
//     console.log(topMovies.fill(userData[i]));
// }
const user = new Array()
console.log(user)

const arr = topMovies.fill(userData[topMovies.length])
console.log(arr)


// Programmatically generate the Array
const pArray = Array.from({length: 7}, () => 1)
console.log(pArray)

const addData = Array.from({length: 7}, (cur, i) => i + 1)

console.log(addData)

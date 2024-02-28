'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKLIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
    owner: 'Jonas Schmedtmann',
    movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
    interestRate: 1.2, // %
    pin: 1111,

    movementsDates: [
        '2019-11-18T21:31:17.178Z',
        '2019-12-23T07:42:02.383Z',
        '2020-01-28T09:15:04.904Z',
        '2020-04-01T10:17:24.185Z',
        '2020-05-08T14:11:59.604Z',
        '2020-02-21T17:01:17.194Z',
        '2024-02-26T18:49:59.371Z',
        '2024-02-27T12:01:20.894Z',
        '2024-02-28T12:01:20.894Z',
    ],
    currency: 'EUR',
    locale: 'pt-PT', // de-DE
};

const account2 = {
    owner: 'Jessica Davis',
    movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
    interestRate: 1.5,
    pin: 2222,

    movementsDates: [
        '2019-11-01T13:15:33.035Z',
        '2019-11-30T09:48:16.867Z',
        '2019-12-25T06:04:23.907Z',
        '2020-01-25T14:18:46.235Z',
        '2020-02-05T16:33:06.386Z',
        '2020-04-10T14:43:26.374Z',
        '2024-01-26T18:49:59.371Z',
        '2024-01-27T12:01:20.894Z',
    ],
    currency: 'USD',
    locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions


/**********************************************
 Set the Current Date and show Transaction Date
 **********************************************/

const formatTransactionDate = function (date, locale) {
    const calcDayPassed = (date1, date2) => Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24))


    const daysPassed = calcDayPassed(new Date(), date)
    if (daysPassed === 1) return `Today`
    if (daysPassed === 2) return `Yesterday`
    if (daysPassed <= 7) return `${daysPassed} days ago`
    // const day = `${date.getDate()}`.padStart(2, "0")
    // const month = `${date.getMonth() + 1}`.padStart(2, "0")
    // const year = date.getFullYear();
    return new Intl.DateTimeFormat(locale).format(date)
}

/*************************
 Format Currency Intl API
 *************************/
const formatCr = function (value, locale, currency) {
    return new Intl.NumberFormat(locale, {
        style: "currency", currency: currency
    }).format(value);
}


const displayMovements = function (acc, sort = false) {
    containerMovements.innerHTML = '';

    const movs = sort ? acc.movements.slice().sort((a, b) => a - b) : acc.movements;

    movs?.forEach(function (mov, i) {
        const type = mov > 0 ? 'deposit' : 'withdrawal';
        const date = new Date(acc.movementsDates[i])
        console.log(date)
        const displayDate = formatTransactionDate(date, acc.locale);

        const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
            i + 1
        } ${type}</div>
        <div class="movements_date">${displayDate}</div>
        <div class="movements__value">${formatCr(mov, acc.locale, acc.currency)}</div>
      </div>
    `;
        containerMovements.insertAdjacentHTML('afterbegin', html);
    });
};


const calcDisplayBalance = function (acc) {
    acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
    labelBalance.textContent = `${formatCr(acc.balance, acc.locale, acc.currency)}`;
};

const calcDisplaySummary = function (acc) {
    const incomes = acc.movements
        .filter(mov => mov > 0)
        .reduce((acc, mov) => acc + mov, 0);
    labelSumIn.textContent = `${formatCr(incomes, acc.locale, acc.currency)}`;

    const out = acc.movements
        .filter(mov => mov < 0)
        .reduce((acc, mov) => acc + mov, 0);
    // labelSumOut.textContent = `${Math.abs(out).toFixed(2)}€`;
    labelSumOut.textContent = `${formatCr(Math.abs(out) , acc.locale, acc.currency)}`;

    const interest = acc.movements
        .filter(mov => mov > 0)
        .map(deposit => (deposit * acc.interestRate) / 100)
        .filter((int, i, arr) => {
            // console.log(arr);
            return int >= 1;
        })
        .reduce((acc, int) => acc + int, 0);
    // labelSumInterest.textContent = `${interest.toFixed(2)}€`;
    labelSumInterest.textContent = `${formatCr(interest, acc.locale, acc.currency)}`;
};

const createUsernames = function (accs) {
    accs.forEach(function (acc) {
        acc.username = acc.owner
            .toLowerCase()
            .split(' ')
            .map(name => name[0])
            .join('');
    });
};
createUsernames(accounts);

const updateUI = function (acc) {
    // Display movements
    displayMovements(acc);

    // Display balance
    calcDisplayBalance(acc);

    // Display summary
    calcDisplaySummary(acc);
};


///////////////////////////////////////
// Event handlers
let currentAccount;
btnLogin.addEventListener('click', function (e) {
    // Prevent form from submitting
    e.preventDefault();

    currentAccount = accounts.find(
        acc => acc.username === inputLoginUsername.value
    );

    if (currentAccount?.pin === +(inputLoginPin.value)) {
        // Display UI and message
        labelWelcome.textContent = `Welcome back, ${
            currentAccount.owner.split(' ')[0]
        }`;
        containerApp.style.opacity = 100;
        /**************************
         Set the Date
         **************************/
            // const now = new Date()
            // const day = `${now.getDate()}`.padStart(2, "0")
            // const month = `${now.getMonth() + 1}`.padStart(2, "0")
            // const year = now.getFullYear()
            // const hour = now.getHours()
            // const min = `${now.getMinutes()}`.padStart(2, "0")
            // labelDate.textContent = `${day}/${month}/${year}/ ${hour} : ${min}`

            // Experimental API Intl
        const now = new Date()
        const options = {
            hours: 'numeric',
            minutes: 'numeric',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            weekday: 'long'
        }

        labelDate.textContent = new Intl.DateTimeFormat(currentAccount.locale, options).format(now)


        // Clear input fields
        inputLoginUsername.value = inputLoginPin.value = '';
        inputLoginPin.blur();

        // Update UI
        updateUI(currentAccount);
    }
});

btnTransfer.addEventListener('click', function (e) {
    e.preventDefault();
    const amount = +(inputTransferAmount.value);
    const receiverAcc = accounts.find(
        acc => acc.username === inputTransferTo.value
    );
    inputTransferAmount.value = inputTransferTo.value = '';

    if (
        amount > 0 &&
        receiverAcc &&
        currentAccount.balance >= amount &&
        receiverAcc?.username !== currentAccount.username
    ) {
        // Doing the transfer
        currentAccount.movements.push(-amount);
        receiverAcc.movements.push(amount);

        //Add the current date
        currentAccount.movementsDates.push(new Date().toISOString())
        receiverAcc.movementsDates.push(new Date().toISOString())

        // Update UI
        updateUI(currentAccount);
    }
});

btnLoan.addEventListener('click', function (e) {
    e.preventDefault();

    const amount = Math.floor(inputLoanAmount.value);

    if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
        // Add movement
        currentAccount.movements.push(amount);

        //Add the current date
        currentAccount.movementsDates.push(new Date().toISOString())

        // Update UI
        updateUI(currentAccount);
    }
    inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
    e.preventDefault();

    if (
        inputCloseUsername.value === currentAccount.username &&
        +(inputClosePin.value) === currentAccount.pin
    ) {
        const index = accounts.findIndex(
            acc => acc.username === currentAccount.username
        );
        console.log(index);
        // .indexOf(23)

        // Delete account
        accounts.splice(index, 1);

        // Hide UI
        containerApp.style.opacity = 0;
    }

    inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
    e.preventDefault();
    displayMovements(currentAccount, !sorted);
    sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

// Base 10 = 0 -9
// Binary base 2  = 0 , 1
// console.log(0.1 + 0.2)

/******************************************
 Number Methods (ParseInt, ParseFloat)
 *******************************************/

// Parsing
// The main purpose of using the parseInt function is to extract a number from a string.
// This turns the returned value to an actual number.
// Type Conversion
// console.log(Number.parseInt('30px')) //  30
// console.log(Number.parseInt('e23')) // Nan

// const age = 'my age is 50'
// console.log(parseInt(age)) // returns Nan
// This happens when we have some text before a number in a string.
// Something like "age is 50" will return a NaN value because the parseInt function
// only looks at the first value starting the string. If the value is not a number, NaN is returned. Here:

//The radix parameter
//The parseInt function accepts a second parameter known as radix.
//This parameter specifies what number system to use. If the radix is omitted then 10 is taken as the default.
// Syntax : Number.parseInt(string, radix) radix defaults 10 This is usually an integer between 2 and 36.
// If the value of the radix is less than 2 or greater than 36 then NaN is returned.

// ParseInt ignore the 0.1 points value if you get the float value the use parseFloat

// console.log(Number.parseFloat("2.3rem"))  // returns 2.3

/************************************************************
 Math Function (Min, Max, Random, Trunc, Round, Ceil Floor)
 **************************************************************/

// console.log(Math.min([2,4,6,7,9,5,2,1]))  // 1

// console.log(Math.max([2,4,6,7,9,5,2,1]))  // 9

// console.log(Math.trunc(Math.random() * 6) + 1 ) // trunc to remove the decimal point

// console.log(Math.round(23.3)) // .3 is less the .5 then give 23
// console.log(Math.round(23.9)) // .9 is greater the .5 then give 24

// console.log(Math.ceil(23.3)) // give 24 always ceil up to the decimal point
// console.log(Math.ceil(23.9)) // give 24 always ceil up to the decimal point

// console.log(Math.floor(23.3))  // give 23 always floor down to the decimal point
// console.log(Math.floor(23.9))  // give 23 always floor down to the decimal point
// console.log(Math.floor(-23.9))  // give 24 always floor down to the decimal point

// console.log(Math.round(23.3)) // .3 is less the .5 then give 23
// console.log(Math.round(23.9)) // .9 is greater the .5 then give 24

/************************************************************
 Change color of Row Using Modulus
 **************************************************************/
labelBalance.addEventListener("click", function (e) {
    [...(document.querySelectorAll(".movements__row"))].forEach((row, i) => {
        if (i % 2 !== 0) row.style.backgroundColor = 'whitesmoke'
    })
})

/**************************
 Dates 3 Ways to Create it
 **************************/
// const date = new Date()
// console.log(date)
// console.log(date.toISOString())
//


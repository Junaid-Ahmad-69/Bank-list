// Intl API

const now = new Date()

const options = {
    hours: 'numeric',
    minutes: 'numeric',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    weekday: 'long'
}
// const locale = navigator.languageCode
// console.log(locale)
console.log(new Intl.DateTimeFormat("en-PK", options).format(now))



const nums = 9776654;

const locale = {
    style: "currency",
    currency: "EUR"
};

console.log(new Intl.NumberFormat("en-US", locale).format(nums));
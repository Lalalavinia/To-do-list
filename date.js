exports.getDate = ()=>{
let today = new Date();
    const options = { weekday: 'long'};
    return today.toLocaleDateString("en-AU",options);
}
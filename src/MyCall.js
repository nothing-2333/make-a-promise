Function.prototype.myCall = function(this_, ...args)
{
    console.log("myCall 执行了");

    const key = Symbol("key");
    this_[key] = this;

    let res = this_[key](...args);
    
    delete this_[key];

    return res;
}

// ---------------------- 测试 ----------------------
const person = {
    name: "nothing",
}
function func(A, B)
{
    console.log(this);
    console.log(A, B);
    return A + B;
}
const res = func.myCall(person, 2, 6);
console.log(res);




Function.prototype.myBind = function(this_, ...bindArgs)
{
    return (...args) => {
        return this.call(this_, ...bindArgs, ...args)
    };
}

// ---------------------- 测试 ----------------------
const person = {
    name: "nothing",
}
function func(A, B, C, D)
{
    console.log(this);
    console.log(A, B, C, D);
    return A + B + C + D;
}

const bindFunc = func.myBind(person, 1, 2);
const res = bindFunc(3, 4);
console.log(res);
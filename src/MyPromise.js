const PENDING = "pending"
const FULFILLED = "fulfilled"
const REJECTED = "rejected"

class MyPromise
{
    state = PENDING;
    result = undefined;
    
    constructor(func)
    {
        const resolve = (result) => {
            if (this.state != PENDING) return ;

            this.state = FULFILLED;
            this.result = result;

            console.log("resolve");
        };
        const reject = (result) => {
            if (this.state != PENDING) return ;

            this.state = REJECTED;
            this.result = result;

            console.log("reject");
        };

        func(resolve, reject);
    }

    then(onFulfilled, onRejected)
    {
        if (typeof onFulfilled != "function") onFulfilled = (x => x);
        if (typeof onRejected != "function") onRejected = (x => { throw x });

        if (this.state == FULFILLED)
        {
            onFulfilled(this.result)
        }
        else if (this.state == REJECTED)
        {
            onRejected(this.result)
        }
    }
}



// ---------------------- 测试 ----------------------
const p = new MyPromise((resolve, reject) => {
    console.log("执行了");
    // resolve("success");
    reject("error");
});

p.then(res => {
    console.log("成功回调，", res)
}, err => {
    console.log("失败回调，", err)
});
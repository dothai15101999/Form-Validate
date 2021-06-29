function Validator(options) {

    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)){
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

    let selectorRules = {};


    // Hàm thực hiện validate
    function validate(inputElement, rule){
        let errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
        let errorMessage;



        //Lấy ra các rules của selector
        let rules = selectorRules[rule.selector]; 


        //Lặp qua từng rule và kiểm tra
        // Nếu có lỗi dừng kiểm tra
        for (let i = 0; i < rules.length; i++){
            errorMessage = rules[i](inputElement.value);
            if (errorMessage) break;
        }

        if(errorMessage) {
            errorElement.innerText = errorMessage;
            getParent(inputElement, options.formGroupSelector).classList.add('invalid');
        } else {
            errorElement.innerText = '';
            getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
        }

        return !errorMessage;
    }



    //Lấy element của form cần validate

    const formElement = document.querySelector(options.form);


    if(formElement){

        if(formElement) {
            formElement.onsubmit = function(e) {
                e.preventDefault();

                let isFormValid = true;
                
                // Lặp qua từng rules và validate
                options.rules.forEach(function (rule) {
                    let inputElement = formElement.querySelector(rule.selector);
                    let isValid = validate(inputElement, rule);
                    if(!isValid) {
                        isFormValid = false;
                    }
                });


                if(isFormValid) {
                    if (typeof options.onSubmit === 'function') {
                        let enableInputs = formElement.querySelectorAll('[name]');

                        let formValues = Array.from(enableInputs).reduce(function(values, input){
                            values[input.name] = input.value;
                            return values;
                        }, {});

                        options.onSubmit(formValues);
                    }
                }
            }
        }


        //Lặp qua mỗi rule và xử lý (lắng nghe sự kiện)
        options.rules.forEach( function (rule) {

            //Lưu lại các rules cho mỗi input

            if(Array.isArray(selectorRules[rule.selector])){
                selectorRules[rule.selector].push(rule.test);                
            } else {
                selectorRules[rule.selector] = [rule.test];                
            }

            const inputElement = formElement.querySelector(rule.selector);
            if(inputElement) {
                inputElement.onblur = function () {
                    validate(inputElement, rule);
                }

                inputElement.oninput = function() {
                    const errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);

                    errorElement.innerText = '';
                    getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
                }

            }
        });
    }
}



Validator.isRequired = function (selector) {
    return {
        selector: selector,
        test: function (value) {
            return value.trim() ? undefined : "Vui lòng nhập thông tin";
        }
    }
}

Validator.isEmail = function (selector) {
    return {
        selector: selector,
        test: function (value) {
            const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
            return regex.test(value) ? undefined : "Vui lòng nhập lại";
        }
    }
}

Validator.minLength = function (selector, min) {
    return {
        selector: selector,
        test: function (value) {
            return value.length >= min ? undefined : `Vui lòng nhập tối thiểu ${min} ký tự`;
        }
    }
}

Validator.isConfirmed = function(selector, getConfirmValue, message) {
    return {
        selector: selector,
        test: function(value){
            return value === getConfirmValue() ? undefined : message || 'Giá trị nhập vào không chính xác';
        }
    }
}
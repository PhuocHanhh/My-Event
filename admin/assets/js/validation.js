function Validator(formSelector) {
    var _this=this;
    var formRules = {};
    //Quy ước tạo rule:
    //-Nếu có lỗi thì return 'error mesage'
    //-Nếu ko có lỗi thì return 'undefined'
    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

    
    var validatorRules = {
        required: function (value) {
            return value ? undefined : 'Vui lòng nhập trường này';
        },
        email: function (value) {
            var regax = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regax.test(value) ? undefined : 'Nhập đúng cú pháp email';
        },
        min: function (min) {
            return function (value) {
                return value.length >= min ? undefined : `Vui Lòng nhập tối thiểu ${min} ký tự`;
            }
        },
    };


    //Lấy ra form element trong DOM theo formSelector
    var formElement = document.querySelector(formSelector);

    //Chỉ xử lý khi có element trong DOM
    if (formElement) {
        var inputs = formElement.querySelectorAll('[name][rules]');
        for (var input of inputs) {

            var rules = input.getAttribute('rules').split('|');
            for (var rule of rules) {
                var isRuleHasValue = rule.includes(':');
                var ruleInfo;

                if (isRuleHasValue) {
                    ruleInfo = rule.split(':');
                    rule = ruleInfo[0];
                }

                var ruleFunc = validatorRules[rule];
                if (isRuleHasValue) {
                    ruleFunc = ruleFunc(ruleInfo[1]);
                }

                if (Array.isArray(formRules[input.name])) {
                    // formRules[input.name].push(validatorRules[rule]);
                    formRules[input.name].push(ruleFunc);
                } else {
                    //formRules[input.name] = [validatorRules[rule]];
                    formRules[input.name] = [ruleFunc];
                }
            }
            //Lắng nghe sự kiện để validate (blur, change,....)
            input.onblur = handleValidate;
            input.oninput = handleClearError;

        }
        //Hàm thực hiện validate
        function handleValidate(event) {
            var rules = formRules[event.target.name];
            var errorMessage;
            for(var rule of rules){
                errorMessage = rule(event.target.value);
                if(errorMessage) break;
            }
            //Nêu có lỗi thì hiễn thị lỗi ra UI
            if (errorMessage) {
                var formGroup = getParent(event.target, '.col-12');
                if (formGroup) {
                    formGroup.classList.add('invalid');
                    var formMessage = formGroup.querySelector('.form-message');
                    if (formMessage) {
                        formMessage.innerText = errorMessage;
                    }
                }
            }
            return !errorMessage;
        }
        //Hàm clear message error
        function handleClearError(event) {
            var formGroup = getParent(event.target, '.col-12');
            if (formGroup.classList.contains('invalid')) {
                formGroup.classList.remove('invalid');

                var formMessage = formGroup.querySelector('.form-message');
                if (formMessage) {
                    formMessage.innerText = '';
                }
            }
        }
    }
    //Xử lý hành vi submit form
    formElement.onsubmit = function (event) {
        event.preventDefault();
        var inputs = formElement.querySelectorAll('[name][rules]');
        var isValid =true;
        for (var input of inputs) {
            if(!handleValidate({   target: input})){
                isValid=false;
            }

        }
       
        //Khi ko có lỗi thì submit form
        if (isValid) {
            if (typeof _this.onSubmit === 'function') {
                var enableInputs = formElement.querySelectorAll('[name]');
                    var formValues = Array.from(enableInputs).reduce(function (values, input) {
                        switch (input.type) {
                           
                            default:
                                values[input.name] = input.value;
                        }
                        return values;
                    }, {});
                    //Gọi lại hàm ónubmit và trả về giá trị của form
                    _this.onSubmit(formValues);
            } else {
                formElement.submit();
            }
        }
    }
    

}

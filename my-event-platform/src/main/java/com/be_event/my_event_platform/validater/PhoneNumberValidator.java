package com.be_event.my_event_platform.validater;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class PhoneNumberValidator implements ConstraintValidator<ValidPhoneNumber, String> {
    private static final String TEN_DIGIT_PHONE_REGEX = "^0\\d{9}$"; // Bắt đầu bằng 0 và có đúng 10 số

    @Override
    public void initialize(ValidPhoneNumber constraintAnnotation) {
    }

    @Override
    public boolean isValid(String phoneNumber, ConstraintValidatorContext context) {
        if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
            return false;
        }
        return phoneNumber.matches(TEN_DIGIT_PHONE_REGEX);
    }
}

package com.backend.backend.JWT;
import org.springframework.stereotype.Component;
import java.util.Arrays;
import org.passay.*;

@Component
public class PasswordConstraintValidator {

    public boolean isValid(String password) {
        PasswordValidator validator = new PasswordValidator(Arrays.asList(
            new LengthRule(8, 30), // Minimum and maximum length
            new CharacterRule(EnglishCharacterData.UpperCase, 1), // At least one upper-case character
            new CharacterRule(EnglishCharacterData.LowerCase, 1), // At least one lower-case character
            new CharacterRule(EnglishCharacterData.Digit, 1), // At least one digit
            new CharacterRule(EnglishCharacterData.Special, 1), // At least one special character
            new WhitespaceRule() // No whitespace
        ));

        RuleResult result = validator.validate(new PasswordData(password));
        if (result.isValid()) {
            return true;
        }
        return false;
    }
}

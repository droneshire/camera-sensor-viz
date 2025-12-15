export const isValidEmail = (email: string) => {
    return !!email
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

export const isValidPassword = (password: string) => {
    // Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character
    return !!password.match(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    );
}

export const isValidName = (name: string) => {
    // Must be a first and last name with at least 2 characters each. No numbers or special characters.
    return !!name.match(/^[a-zA-Z]{2,} [a-zA-Z]{2,}$/);
}

export const isValidPhone = (phone: string) => {
    // Must be a valid phone number, can have dashes like XXX-XXX-XXXX
    // can also be international like +65 XXXX XXXX, so the input could be
    // between 10 and 12 characters
    return !!phone.match(/^(\+?[0-9]{10,12})$/);
}

export const isValidZip = (zip: string) => {
    // Must be a valid zip code
    return !!zip.match(/^[0-9]{5}$/);
}

export const isValidAddress = (address: string) => {
    // Must be a valid address. With a number and a street name
    return !!address.match(/^[0-9]+ [a-zA-Z]+/);
}

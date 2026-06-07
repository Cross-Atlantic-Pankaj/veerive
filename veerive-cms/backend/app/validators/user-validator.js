import User from '../models/user-model.js';

export const userRegisterSchema = {
    email: {
        exists: {
            errorMessage: 'Email field is required'
        },
        notEmpty: {
            errorMessage: 'Email cannot be empty'
        },
        isEmail: {
            errorMessage: 'Email should be in a valid format'
        },
        trim: true,
        normalizeEmail: true,
        custom: {
            options: async (value) => {
                const user = await User.findOne({ email: value });
                if (user) {
                    throw new Error('Email is already taken');
                }
                return true;
            }
        }
    },
    password: {
        exists: {
            errorMessage: 'Password is required'
        },
        notEmpty: {
            errorMessage: 'Password cannot be empty'
        },
        trim: true
    }
};

export const userLoginSchema = {
    email: {
        exists: {
            errorMessage: 'Email field is required'
        },
        notEmpty: {
            errorMessage: 'Email cannot be empty'
        },
        isEmail: {
            errorMessage: 'Email should be in a valid format'
        },
        trim: true,
        normalizeEmail: true
    },
    password: {
        exists: {
            errorMessage: 'Password is required'
        },
        notEmpty: {
            errorMessage: 'Password cannot be empty'
        }
    }
};

export const forgotPasswordSchema = {
    email: {
        exists: {
            errorMessage: 'Email field is required'
        },
        notEmpty: {
            errorMessage: 'Email cannot be empty'
        },
        isEmail: {
            errorMessage: 'Email should be in a valid format'
        },
        trim: true,
        normalizeEmail: true
    }
};

export const resetPasswordSchema = {
    token: {
        exists: {
            errorMessage: 'Token is required'
        },
        notEmpty: {
            errorMessage: 'Token cannot be empty'
        }
    },
    newPassword: {
        exists: {
            errorMessage: 'New password is required'
        },
        notEmpty: {
            errorMessage: 'New password cannot be empty'
        },
        isStrongPassword: {
            options: {
                minLength: 8,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1
            },
            errorMessage: 'New password must be at least 8 characters long and include at least one lowercase letter, one uppercase letter, one number, and one symbol'
        },
        trim: true
    }
};
export const updateEmailSchema = {
    email: {
        exists: {
            errorMessage: 'Email field is required'
        },
        notEmpty: {
            errorMessage: 'Email cannot be empty'
        },
        isEmail: {
            errorMessage: 'Email should be in a valid format'
        },
        trim: true,
        normalizeEmail: true,
        custom: {
            options: async (value) => {
                const user = await User.findOne({ email: value });
                if (user) {
                    throw new Error('Email is already taken');
                }
                return true;
            }
        }
    }
};

export const updatePasswordSchema = {
    currentPassword: {
        exists: {
            errorMessage: 'Current password is required'
        },
        notEmpty: {
            errorMessage: 'Current password cannot be empty'
        }
    },
    newPassword: {
        exists: {
            errorMessage: 'New password is required'
        },
        notEmpty: {
            errorMessage: 'New password cannot be empty'
        },
        trim: true
    }
};

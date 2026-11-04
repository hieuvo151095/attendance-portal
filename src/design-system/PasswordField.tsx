import React, { useState } from 'react';
import { TextField, TextFieldProps } from './TextField';
import { Icon } from './Icon';

export interface PasswordFieldProps
  extends Omit<TextFieldProps, 'type' | 'suffix'> {
  showToggle?: boolean;
}

export const PasswordField: React.FC<PasswordFieldProps> = ({
  prefixIcon = 'lock',
  showToggle = true,
  placeholder = 'Nhập mật khẩu',
  ...rest
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const toggleBtn = showToggle ? (
    <button
      type="button"
      className="ecomd-field__suffix-btn"
      onClick={() => setShowPassword((prev) => !prev)}
      title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
      aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
    >
      <Icon name={showPassword ? 'eye-slash' : 'eye'} size={15} />
    </button>
  ) : null;

  return (
    <TextField
      {...rest}
      type={showPassword ? 'text' : 'password'}
      prefixIcon={prefixIcon}
      placeholder={placeholder}
      suffix={toggleBtn}
    />
  );
};

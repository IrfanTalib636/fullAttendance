import {StyleSheet} from 'react-native';
import React, {useMemo, useState} from 'react';
import {useResponsiveDimensions} from '../hooks';
import {Dropdown} from 'react-native-element-dropdown';
import {COLORS} from '../enums';

interface dropdownProps {
  data: any;
  value: any;
  handleValue: any;
  customWidth?: number;
  fullWidth?: boolean;
  placeholder?: string;
}

export const DropdownComponent = (props: dropdownProps) => {
  const {data, value, handleValue, customWidth, fullWidth, placeholder} = props;
  const {hp, wp} = useResponsiveDimensions();
  const [isFocus, setIsFocus] = useState(false);
  const styles = useMemo(() => {
    return StyleSheet.create({
      dropdown: {
        width: customWidth ? hp(customWidth) : fullWidth ? '100%' : hp(120),
        height: 40,
        borderColor: 'gray',
        borderWidth: 0.5,
        borderRadius: 8,
        paddingHorizontal: 8,
      },
      icon: {
        marginRight: 5,
      },
      label: {
        position: 'absolute',
        backgroundColor: 'white',
        left: 22,
        top: 8,
        zIndex: 999,
        paddingHorizontal: 8,
        fontSize: 14,
      },
      placeholderStyle: {
        fontSize: 14,
      },
      selectedTextStyle: {
        fontSize: 16,
      },
      iconStyle: {
        width: 20,
        height: 20,
      },
      inputSearchStyle: {
        height: 40,
        fontSize: 16,
      },
    });
  }, [hp, wp]);
  return (
    <Dropdown
      style={[styles.dropdown, isFocus && {borderColor: COLORS.PRIMARY}]}
      placeholderStyle={styles.placeholderStyle}
      selectedTextStyle={styles.selectedTextStyle}
      inputSearchStyle={styles.inputSearchStyle}
      iconStyle={styles.iconStyle}
      data={data}
      maxHeight={300}
      labelField="label"
      valueField="value"
      placeholder={
        !isFocus ? (placeholder ? placeholder : 'Select Tags') : '...'
      }
      searchPlaceholder="Search..."
      value={value}
      onFocus={() => setIsFocus(true)}
      onBlur={() => setIsFocus(false)}
      onChange={item => {
        handleValue(item.value);
        setIsFocus(false);
      }}
    />
  );
};

import React from 'react';
import * as Select from '@radix-ui/react-select';
import { CheckIcon, ChevronDownIcon } from '@radix-ui/react-icons';


//implementing RadixUI Select as a reusable component because it shows up multiple places across the app
export default function CustomSelect({ value, onValueChange, options, placeholder, triggerClassName, triggerStyle }) {
    return (
        <Select.Root value={value} onValueChange={onValueChange}>
            <Select.Trigger className={`radix-select-trigger ${triggerClassName || ''}`} aria-label={placeholder} style={{display: 'flex', ...triggerStyle}}>
                <div className="select-value-wrapper">
                    <Select.Value placeholder={placeholder} />
                </div>
                <Select.Icon className="radix-select-icon">
                    <ChevronDownIcon />
                </Select.Icon>
            </Select.Trigger>

            <Select.Portal>
                <Select.Content className="radix-select-content" position="popper" sideOffset={5}>
                    <Select.ScrollUpButton className="radix-select-scroll-button">
                        ▲
                    </Select.ScrollUpButton>
                    <Select.Viewport className="radix-select-viewport">
                        {options.map((option) => (
                            <Select.Item 
                                key={option.value} 
                                value={option.value} 
                                className="radix-select-item"
                                style={option.style} // For priority colors
                            >
                                <Select.ItemText>{option.label}</Select.ItemText>
                                <Select.ItemIndicator className="radix-select-item-indicator">
                                    <CheckIcon />
                                </Select.ItemIndicator>
                            </Select.Item>
                        ))}
                    </Select.Viewport>
                    <Select.ScrollDownButton className="radix-select-scroll-button">
                        ▼
                    </Select.ScrollDownButton>
                </Select.Content>
            </Select.Portal>
        </Select.Root>
    );
}
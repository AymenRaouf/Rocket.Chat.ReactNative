import React, { useState } from 'react';
import {
	View, Modal, StyleSheet, Text
} from 'react-native';
import PropTypes from 'prop-types';
import DateTimePicker from '@react-native-community/datetimepicker';
import { BLOCK_CONTEXT } from '@rocket.chat/ui-kit';

import Button from '../Button';
import { extractText } from './utils';
import { defaultTheme } from '../../utils/theme';
import { themes } from '../../constants/colors';

import sharedStyles from '../../views/Styles';
import { CustomIcon } from '../../lib/Icons';
import { isIOS, isAndroid } from '../../utils/deviceInfo';
import Touch from '../../utils/touch';
import ActivityIndicator from '../ActivityIndicator';

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'flex-end'
	},
	modal: {
		height: 260,
		width: '100%'
	},
	input: {
		height: 48,
		paddingLeft: 16,
		borderWidth: StyleSheet.hairlineWidth,
		borderRadius: 2,
		alignItems: 'center',
		flexDirection: 'row'
	},
	inputText: {
		...sharedStyles.textRegular,
		fontSize: 14
	},
	icon: {
		right: 16,
		position: 'absolute'
	},
	loading: {
		padding: 0
	}
});

export const DatePicker = ({
	element, action, context, loading, theme
}) => {
	const [show, onShow] = useState(false);
	const { initial_date, placeholder } = element;
	const [currentDate, onChangeDate] = useState(new Date(initial_date));

	const onChange = ({ nativeEvent: { timestamp } }, date) => {
		const newDate = date || new Date(timestamp);
		onChangeDate(newDate);
		newDate.setHours(0);
		action({ value: newDate.toJSON().slice(0, 10) });
		if (isAndroid) {
			onShow(false);
		}
	};

	let button = (
		<Button
			title={extractText(placeholder)}
			onPress={() => onShow(!show)}
			loading={loading}
			theme={theme}
		/>
	);

	if (context === BLOCK_CONTEXT.FORM) {
		button = (
			<Touch
				onPress={() => onShow(!show)}
				style={{ backgroundColor: themes[theme].backgroundColor }}
				theme={theme}
			>
				<View style={[styles.input, { borderColor: themes[theme].separatorColor }]}>
					<Text
						style={[
							styles.inputText,
							{ color: themes[theme].titleText }
						]}
					>
						{currentDate.toLocaleDateString('en-US')}
					</Text>
					{
						loading
							? <ActivityIndicator style={[styles.loading, styles.icon]} />
							: <CustomIcon name='calendar' size={20} color={themes[theme].auxiliaryText} style={styles.icon} />
					}
				</View>
			</Touch>
		);
	}

	let content = show ? (
		<DateTimePicker
			mode='date'
			display='default'
			value={currentDate}
			onChange={onChange}
		/>
	) : null;

	if (isIOS) {
		content = (
			<Modal
				animationType='slide'
				transparent
				visible={show}
				onRequestClose={() => onShow(false)}
			>
				<View style={[styles.overlay, { backgroundColor: `${ themes[theme].backdropColor }30` }]}>
					{/* unfortunately we can't change datepicker text color, then we use background based on system theme */}
					<View style={[styles.modal, { backgroundColor: themes[defaultTheme()].backgroundColor }]}>
						<Button
							title='done'
							onPress={() => onShow(false)}
							theme={theme}
							style={{ margin: 0 }}
						/>
						{content}
					</View>
				</View>
			</Modal>
		);
	}

	return (
		<>
			{button}
			{content}
		</>
	);
};
DatePicker.propTypes = {
	element: PropTypes.object,
	action: PropTypes.func,
	context: PropTypes.number,
	loading: PropTypes.bool,
	theme: PropTypes.string
};

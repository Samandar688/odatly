import sys

with open('App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Imports
content = content.replace(
    "import { requestPermissionsAsync, scheduleHabitNotifications, cancelHabitNotifications } from './src/notifications';",
    "import { requestPermissionsAsync, scheduleHabitNotifications, cancelHabitNotifications } from './src/notifications';\nimport DateTimePicker from '@react-native-community/datetimepicker';"
)

content = content.replace(
    "import { completionStats, dataKey, logForToday, makeId, slugName, todayKey, formatTimeInput } from './src/utils';",
    "import { completionStats, dataKey, logForToday, makeId, slugName, todayKey } from './src/utils';"
)

# 2. State
content = content.replace(
    "  const [habitTime, setHabitTime] = useState('07:00');",
    "  const [habitTime, setHabitTime] = useState('07:00');\n  const [showTimePicker, setShowTimePicker] = useState(false);"
)

# 3. TextInput -> DateTimePicker
old_input = '''            <Text style={styles.label}>Eslatma vaqti</Text>
            <TextInput
              value={habitTime}
              onChangeText={(val) => setHabitTime(formatTimeInput(val))}
              placeholder="07:00"
              maxLength={5}
              placeholderTextColor="#9AA1A9"
              style={styles.input}
              keyboardType="numbers-and-punctuation"
            />'''

new_input = '''            <Text style={styles.label}>Eslatma vaqti</Text>
            <Pressable onPress={() => setShowTimePicker(true)} style={[styles.input, { justifyContent: 'center' }]}>
              <Text style={{ color: habitTime ? C.ink : '#9AA1A9', fontSize: 15 }}>{habitTime || "07:00"}</Text>
            </Pressable>
            {showTimePicker && (
              <DateTimePicker
                value={(() => {
                  const [h, m] = (habitTime || "07:00").split(':');
                  const d = new Date();
                  d.setHours(Number(h) || 7, Number(m) || 0, 0, 0);
                  return d;
                })()}
                mode="time"
                is24Hour={true}
                display="spinner"
                onChange={(event, date) => {
                  setShowTimePicker(Platform.OS === 'ios');
                  if (event.type === 'set' && date) {
                    const h = date.getHours().toString().padStart(2, '0');
                    const m = date.getMinutes().toString().padStart(2, '0');
                    setHabitTime(`${h}:${m}`);
                    if (Platform.OS === 'android') setShowTimePicker(false);
                  } else if (event.type === 'dismissed') {
                    setShowTimePicker(false);
                  }
                }}
              />
            )}'''

content = content.replace(old_input, new_input)

with open('App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

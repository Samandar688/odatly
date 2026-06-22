import sys
import re

with open('src/screens.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

new_today_screen = '''export function TodayScreen({
  profile,
  habits,
  logs,
  stats,
  onAdd,
  onCheckIn,
  onOpenDetail,
}: {
  profile: Profile;
  habits: Habit[];
  logs: HabitLog[];
  stats: ReturnType<typeof completionStats>;
  onAdd: () => void;
  onCheckIn: (habitId: string, status: LogStatus) => void;
  onOpenDetail: (habit: Habit) => void;
}) {
  const firstName = profile.fullName.split(' ')[0];
  const [motivationIndex, setMotivationIndex] = useState(0);
  const motivation = MOTIVATION_SLIDES[motivationIndex];

  useEffect(() => {
    const interval = setInterval(() => {
      setMotivationIndex((current) => (current + 1) % MOTIVATION_SLIDES.length);
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  const showPreviousMotivation = () => {
    setMotivationIndex((current) => (current === 0 ? MOTIVATION_SLIDES.length - 1 : current - 1));
  };

  const showNextMotivation = () => {
    setMotivationIndex((current) => (current + 1) % MOTIVATION_SLIDES.length);
  };

  return (
    <View style={{ gap: 16 }}>
      <View style={{ paddingHorizontal: 4, marginTop: 8, marginBottom: 8 }}>
        <Text style={{ color: '#7B8088', fontSize: 14, fontWeight: '600' }}>Bugun, {displayDate(new Date())}</Text>
        <Text style={{ color: '#1C2035', fontSize: 26, fontWeight: '900', marginTop: 4 }}>Salom, {firstName}</Text>
      </View>

      <View style={[styles.motivationCard, { backgroundColor: '#107584', borderRadius: 24, padding: 20 }]}>
        <View style={styles.motivationHeader}>
          <Text style={[styles.motivationTag, { color: '#fff' }]}>{motivation.tag}</Text>
          <Text style={[styles.motivationCount, { color: '#fff' }]}>{motivationIndex + 1}/{MOTIVATION_SLIDES.length}</Text>
        </View>
        <Text style={[styles.motivationTitle, { color: '#fff' }]}>{motivation.title}</Text>
        <Text style={[styles.motivationText, { color: 'rgba(255,255,255,0.8)' }]}>{motivation.text}</Text>
        <View style={styles.motivationControls}>
          <Pressable onPress={showPreviousMotivation} style={[styles.motivationNavButton, { borderColor: 'rgba(255,255,255,0.2)' }]}>
            <Text style={[styles.motivationNavText, { color: '#fff' }]}>{'<'}</Text>
          </Pressable>
          <View style={styles.motivationDots}>
            {MOTIVATION_SLIDES.map((item, index) => (
              <Pressable
                key={item.tag}
                onPress={() => setMotivationIndex(index)}
                style={[styles.motivationDot, motivationIndex === index && { backgroundColor: '#fff', width: 20 }, { backgroundColor: 'rgba(255,255,255,0.4)' }]}
              />
            ))}
          </View>
          <Pressable onPress={showNextMotivation} style={[styles.motivationNavButton, { borderColor: 'rgba(255,255,255,0.2)' }]}>
            <Text style={[styles.motivationNavText, { color: '#fff' }]}>{'>'}</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.todaySummaryCard}>
        <View style={styles.todaySummaryTop}>
          <View style={styles.flex}>
            <Text style={styles.sectionTitle}>Bugungi holat</Text>
            <Text style={styles.muted}>
              {stats.planned.length === 0 ? "Bugun odat yo'q" : `${stats.done} ta bajarildi, ${stats.planned.length} ta reja`}
            </Text>
          </View>
          <View style={styles.compactPercent}>
            <Text style={styles.compactPercentText}>{stats.pct}%</Text>
          </View>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${stats.pct}%` }]} />
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Odatlarning progressi</Text>
      </View>

      {stats.planned.length === 0 ? (
        <EmptyState
          title="Hozircha odat yo'q"
          text="Birinchi odatingizni qo'shing va bugundan boshlang."
          action="Odat qo'shish"
          onPress={onAdd}
        />
      ) : (
        <View style={styles.todayTasksList}>
          {stats.planned.map((habit) => {
            const completion = habitCompletion(habit, logs);
            return (
              <View key={habit.id} style={styles.habitTaskCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={styles.habitName}>{habit.name}</Text>
                  <Text style={styles.habitPercent}>{completion.pct}%</Text>
                </View>
                <Text style={styles.muted}>{completion.done}/{completion.planned} marotaba bajarilgan</Text>
                <View style={[styles.progressTrack, { marginTop: 8 }]}>
                  <View style={[styles.progressFill, { width: `${completion.pct}%`, backgroundColor: habit.color }]} />
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}'''

# Replace the TodayScreen component
pattern = re.compile(r'export function TodayScreen\(.*?\{.*?return\s*\(.*?\);\n\}', re.DOTALL)
content = pattern.sub(new_today_screen, content)

with open('src/screens.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

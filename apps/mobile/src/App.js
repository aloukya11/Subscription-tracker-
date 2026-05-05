import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "http://localhost:4000";
const APP_STATE_KEY = "ghostbuster.appstate.v1";

const screens = {
  welcome: "welcome",
  capabilities: "capabilities",
  sourceSetup: "sourceSetup",
  scanning: "scanning",
  review: "review",
  dashboard: "dashboard",
  subscriptions: "subscriptions",
  familyScan: "familyScan"
};

const mockDetections = [
  { id: "s1", merchant: "Netflix", amount: 649, cadence: "monthly", confidence: 0.95, ghost: false },
  { id: "s2", merchant: "Midjourney", amount: 960, cadence: "monthly", confidence: 0.64, ghost: true },
  { id: "s3", merchant: "Prime Video", amount: 299, cadence: "monthly", confidence: 0.91, ghost: false }
];

function Pill({ label, value, warning }) {
  return (
    <View style={[styles.pill, warning && styles.pillWarn]}>
      <Text style={styles.pillLabel}>{label}</Text>
      <Text style={styles.pillValue}>{value}</Text>
    </View>
  );
}

function ActionButton({ label, onPress, subtle, disabled }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[styles.btn, subtle ? styles.btnSubtle : styles.btnPrimary, disabled && styles.btnDisabled]}
    >
      <Text style={[styles.btnText, subtle && styles.btnTextSubtle]}>{label}</Text>
    </TouchableOpacity>
  );
}

async function parseJsonOrThrow(response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.error || "request_failed");
  }
  return body;
}

export default function App() {
  const [screen, setScreen] = useState(screens.welcome);
  const [permissions, setPermissions] = useState({ sms: false, notification: false, manual: true });
  const [income, setIncome] = useState("50000");
  const [reviewedIds, setReviewedIds] = useState([]);
  const [isHydrated, setIsHydrated] = useState(false);

  const [familySession, setFamilySession] = useState(null);
  const [familyError, setFamilyError] = useState("");
  const [familyBusy, setFamilyBusy] = useState(false);
  const [familyResultStatus, setFamilyResultStatus] = useState("");

  const detected = useMemo(() => mockDetections, []);
  const reviewQueue = detected.filter((d) => d.confidence < 0.8 && !reviewedIds.includes(d.id));
  const ghostCount = detected.filter((d) => d.ghost).length;
  const monthlySpend = detected.reduce((sum, d) => sum + d.amount, 0);
  const healthScore = Math.max(
    0,
    1000 - Math.round((monthlySpend / Math.max(Number(income) || 1, 1)) * 900) - ghostCount * 60
  );

  useEffect(() => {
    async function loadState() {
      try {
        const raw = await AsyncStorage.getItem(APP_STATE_KEY);
        if (!raw) return setIsHydrated(true);
        const parsed = JSON.parse(raw);
        if (parsed.permissions) setPermissions(parsed.permissions);
        if (typeof parsed.income === "string") setIncome(parsed.income);
        if (Array.isArray(parsed.reviewedIds)) setReviewedIds(parsed.reviewedIds);
        if (parsed.familySession) setFamilySession(parsed.familySession);
      } catch (_error) {
      } finally {
        setIsHydrated(true);
      }
    }
    loadState();
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    AsyncStorage.setItem(
      APP_STATE_KEY,
      JSON.stringify({
        permissions,
        income,
        reviewedIds,
        familySession
      })
    ).catch(() => {});
  }, [permissions, income, reviewedIds, familySession, isHydrated]);

  const nextFromWelcome = () => setScreen(screens.capabilities);
  const nextFromCapabilities = () => setScreen(screens.sourceSetup);
  const nextFromSources = () => setScreen(screens.scanning);

  const togglePermission = (key) => setPermissions((p) => ({ ...p, [key]: !p[key] }));

  async function createFamilyScanSession() {
    setFamilyBusy(true);
    setFamilyError("");
    setFamilyResultStatus("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/family-scan/init`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requesterDeviceIdHash: "mobile_device_local_hash_v1",
          childPublicKey: "child_public_key_placeholder_local_dev_abcdefghijklmnopqrstuvwxyz",
          expiresInMinutes: 1440
        })
      });
      const data = await parseJsonOrThrow(response);
      setFamilySession({
        sessionId: data.sessionId,
        readToken: data.readToken,
        parentUrl: data.parentUrl,
        expiresAt: data.expiresAt
      });
      setFamilyResultStatus("pending");
    } catch (error) {
      setFamilyError(`Could not create session: ${error.message}`);
    } finally {
      setFamilyBusy(false);
    }
  }

  async function pollFamilyScanResult() {
    if (!familySession?.sessionId || !familySession?.readToken) return;
    setFamilyBusy(true);
    setFamilyError("");
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/family-scan/results/${familySession.sessionId}`,
        {
          headers: { Authorization: `Bearer ${familySession.readToken}` }
        }
      );
      const data = await parseJsonOrThrow(response);
      setFamilyResultStatus(data.status || "unknown");
    } catch (error) {
      setFamilyError(`Could not fetch result: ${error.message}`);
    } finally {
      setFamilyBusy(false);
    }
  }

  async function revokeFamilyScanSession() {
    if (!familySession?.sessionId || !familySession?.readToken) return;
    setFamilyBusy(true);
    setFamilyError("");
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/family-scan/${familySession.sessionId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${familySession.readToken}` }
        }
      );
      if (!response.ok && response.status !== 204) {
        throw new Error("revoke_failed");
      }
      setFamilyResultStatus("revoked");
      setFamilySession(null);
    } catch (error) {
      setFamilyError(`Could not revoke session: ${error.message}`);
    } finally {
      setFamilyBusy(false);
    }
  }

  const renderWelcome = () => (
    <View style={styles.card}>
      <Text style={styles.title}>Subscription Ghost Buster</Text>
      <Text style={styles.copy}>
        Local-first subscription detection. We process on-device when possible, and show manual options when permissions
        are unavailable.
      </Text>
      <ActionButton label="Start Setup" onPress={nextFromWelcome} />
    </View>
  );

  const renderCapabilities = () => (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Device Capability Check</Text>
      <Text style={styles.copy}>Automated scan is Android-first. You can always continue with manual import.</Text>
      <Pill label="SMS Scan" value="Android only" />
      <Pill label="Notification Scan" value="Android only" />
      <Pill label="Manual Import" value="Available" />
      <ActionButton label="Continue" onPress={nextFromCapabilities} />
    </View>
  );

  const renderSourceSetup = () => (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Source Setup</Text>
      <Text style={styles.copy}>Choose sources to enable before scan.</Text>
      {[
        { key: "sms", label: "SMS receipts" },
        { key: "notification", label: "Notification events" },
        { key: "manual", label: "Manual entry fallback" }
      ].map((item) => (
        <TouchableOpacity key={item.key} style={styles.row} onPress={() => togglePermission(item.key)}>
          <Text style={styles.rowLabel}>{item.label}</Text>
          <Text style={styles.rowState}>{permissions[item.key] ? "ON" : "OFF"}</Text>
        </TouchableOpacity>
      ))}
      <ActionButton label="Run Scan" onPress={nextFromSources} />
    </View>
  );

  const renderScanning = () => (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Scan Progress</Text>
      <Text style={styles.copy}>Fast rules pass completed. Parser review found {detected.length} likely subscriptions.</Text>
      <Pill label="Low-confidence items" value={String(reviewQueue.length)} warning={reviewQueue.length > 0} />
      <ActionButton label="Review Items" onPress={() => setScreen(screens.review)} />
      <ActionButton label="Skip to Dashboard" subtle onPress={() => setScreen(screens.dashboard)} />
    </View>
  );

  const renderReview = () => (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Review Queue</Text>
      {reviewQueue.length === 0 ? <Text style={styles.copy}>No pending low-confidence detections.</Text> : null}
      {reviewQueue.map((item) => (
        <View key={item.id} style={styles.reviewItem}>
          <Text style={styles.reviewTitle}>{item.merchant}</Text>
          <Text style={styles.copy}>
            INR {item.amount} / {item.cadence} | Confidence {Math.round(item.confidence * 100)}%
          </Text>
          <ActionButton label="Mark Reviewed" onPress={() => setReviewedIds((ids) => ids.concat(item.id))} subtle />
        </View>
      ))}
      <ActionButton label="Go to Dashboard" onPress={() => setScreen(screens.dashboard)} />
    </View>
  );

  const renderDashboard = () => (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Dashboard</Text>
      <Pill label="Health Score" value={String(healthScore)} />
      <Pill label="Monthly Spend" value={`INR ${monthlySpend}`} />
      <Pill label="Possible Ghosts" value={String(ghostCount)} warning={ghostCount > 0} />
      <Text style={styles.smallLabel}>Monthly income (local only)</Text>
      <TextInput
        value={income}
        onChangeText={setIncome}
        keyboardType="numeric"
        style={styles.input}
        placeholder="Enter income"
      />
      <ActionButton label="View Subscriptions" onPress={() => setScreen(screens.subscriptions)} />
      <ActionButton label="Family Scan" subtle onPress={() => setScreen(screens.familyScan)} />
    </View>
  );

  const renderSubscriptions = () => (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Subscriptions</Text>
      {detected.map((item) => (
        <View key={item.id} style={styles.subscriptionRow}>
          <View>
            <Text style={styles.reviewTitle}>{item.merchant}</Text>
            <Text style={styles.copy}>INR {item.amount} / {item.cadence}</Text>
          </View>
          <Text style={[styles.ghostTag, item.ghost ? styles.ghostOn : styles.ghostOff]}>
            {item.ghost ? "POSSIBLE GHOST" : "ACTIVE"}
          </Text>
        </View>
      ))}
      <ActionButton label="Back to Dashboard" onPress={() => setScreen(screens.dashboard)} subtle />
    </View>
  );

  const renderFamilyScan = () => (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Family Scan</Text>
      <Text style={styles.copy}>Create an invite session, share parent URL, then poll for approved summary status.</Text>
      {!familySession ? (
        <ActionButton label={familyBusy ? "Creating..." : "Create Invite Session"} onPress={createFamilyScanSession} disabled={familyBusy} />
      ) : (
        <View style={styles.reviewItem}>
          <Text style={styles.reviewTitle}>Session</Text>
          <Text style={styles.copy}>ID: {familySession.sessionId}</Text>
          <Text style={styles.copy}>Status: {familyResultStatus || "pending"}</Text>
          <Text style={styles.copy}>Expires: {familySession.expiresAt}</Text>
          <Text style={styles.smallLabel}>Parent Link</Text>
          <Text style={styles.linkText}>{familySession.parentUrl}</Text>
          <ActionButton label={familyBusy ? "Polling..." : "Poll Result"} onPress={pollFamilyScanResult} disabled={familyBusy} />
          <ActionButton label="Revoke Session" subtle onPress={revokeFamilyScanSession} disabled={familyBusy} />
        </View>
      )}
      {familyError ? <Text style={styles.errorText}>{familyError}</Text> : null}
      <ActionButton label="Back to Dashboard" onPress={() => setScreen(screens.dashboard)} subtle />
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.topNav}>
        <Text style={styles.navTitle}>Ghost Buster Mobile</Text>
        <Text style={styles.navStep}>{screen}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        {screen === screens.welcome ? renderWelcome() : null}
        {screen === screens.capabilities ? renderCapabilities() : null}
        {screen === screens.sourceSetup ? renderSourceSetup() : null}
        {screen === screens.scanning ? renderScanning() : null}
        {screen === screens.review ? renderReview() : null}
        {screen === screens.dashboard ? renderDashboard() : null}
        {screen === screens.subscriptions ? renderSubscriptions() : null}
        {screen === screens.familyScan ? renderFamilyScan() : null}
      </ScrollView>
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => setScreen(screens.dashboard)} style={styles.bottomBtn}>
          <Text style={styles.bottomBtnText}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setScreen(screens.review)} style={styles.bottomBtn}>
          <Text style={styles.bottomBtnText}>Review</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setScreen(screens.familyScan)} style={styles.bottomBtn}>
          <Text style={styles.bottomBtnText}>Family</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f4f7fb"
  },
  topNav: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomColor: "#d7dfea",
    borderBottomWidth: 1,
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  navTitle: {
    color: "#1f2b3d",
    fontWeight: "700",
    fontSize: 16
  },
  navStep: {
    color: "#58657b",
    fontSize: 12
  },
  scroll: {
    padding: 14,
    paddingBottom: 94
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#d9e2f1",
    marginBottom: 12
  },
  title: {
    fontSize: 24,
    color: "#172436",
    fontWeight: "700",
    marginBottom: 8
  },
  sectionTitle: {
    fontSize: 20,
    color: "#1e2b3f",
    fontWeight: "700",
    marginBottom: 8
  },
  copy: {
    color: "#5e6d84",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8
  },
  pill: {
    borderColor: "#d0d9e9",
    borderWidth: 1,
    borderRadius: 7,
    padding: 10,
    marginBottom: 8,
    backgroundColor: "#fbfdff"
  },
  pillWarn: {
    borderColor: "#d35f3f",
    backgroundColor: "#fff7f4"
  },
  pillLabel: {
    color: "#55657d",
    fontSize: 12
  },
  pillValue: {
    color: "#1e2b3f",
    fontSize: 16,
    fontWeight: "700"
  },
  btn: {
    borderRadius: 6,
    paddingVertical: 11,
    paddingHorizontal: 12,
    marginTop: 8
  },
  btnPrimary: {
    backgroundColor: "#0d6c75"
  },
  btnSubtle: {
    backgroundColor: "#e9eef7"
  },
  btnDisabled: {
    opacity: 0.6
  },
  btnText: {
    color: "#ffffff",
    textAlign: "center",
    fontWeight: "700"
  },
  btnTextSubtle: {
    color: "#233249"
  },
  row: {
    borderColor: "#d0d8e8",
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  rowLabel: {
    color: "#24334b",
    fontWeight: "600"
  },
  rowState: {
    color: "#0d6c75",
    fontWeight: "700"
  },
  reviewItem: {
    borderColor: "#d0d8e8",
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginBottom: 8
  },
  reviewTitle: {
    color: "#1b2940",
    fontWeight: "700",
    fontSize: 15
  },
  smallLabel: {
    color: "#617089",
    fontSize: 12,
    marginTop: 6
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccd6e8",
    borderRadius: 6,
    backgroundColor: "#ffffff",
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginTop: 5
  },
  subscriptionRow: {
    borderWidth: 1,
    borderColor: "#d6deec",
    borderRadius: 7,
    padding: 10,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  ghostTag: {
    fontSize: 11,
    fontWeight: "700",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 5,
    overflow: "hidden"
  },
  ghostOn: {
    color: "#8e2e1d",
    backgroundColor: "#ffe8e1"
  },
  ghostOff: {
    color: "#1e5d36",
    backgroundColor: "#e6f6ec"
  },
  linkText: {
    fontSize: 12,
    color: "#0b4d7f",
    marginTop: 4
  },
  errorText: {
    color: "#a52a2a",
    marginTop: 8
  },
  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 66,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#d5ddeb",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 8
  },
  bottomBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  bottomBtnText: {
    color: "#2a3a55",
    fontWeight: "700",
    fontSize: 13
  }
});


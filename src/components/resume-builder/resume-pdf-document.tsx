import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { ResumeContent, LayoutSettings } from "@/lib/types";
import { formatDate } from "@/lib/utils";

interface ResumePDFDocumentProps {
  content: ResumeContent;
  layout: LayoutSettings;
}

const PAGE_SIZES = {
  a4: { width: 595.28, height: 841.89 },
  letter: { width: 612, height: 792 },
};

function mmToPt(mm: number) {
  return mm * 2.835;
}

export function ResumePDFDocument({ content, layout }: ResumePDFDocumentProps) {
  const pageSize = PAGE_SIZES[layout.page.size];
  const margins = {
    top: mmToPt(layout.page.margins.top),
    right: mmToPt(layout.page.margins.right),
    bottom: mmToPt(layout.page.margins.bottom),
    left: mmToPt(layout.page.margins.left),
  };

  const baseFontSize = layout.typography.fontSize;
  const lineHeight = layout.typography.lineHeight;

  const styles = StyleSheet.create({
    page: {
      paddingTop: margins.top,
      paddingRight: margins.right,
      paddingBottom: margins.bottom,
      paddingLeft: margins.left,
      fontFamily: "Helvetica",
      fontSize: baseFontSize,
      lineHeight,
    },
    name: {
      fontSize: baseFontSize * 2,
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 2,
    },
    subtitle: {
      fontSize: baseFontSize + 1,
      textAlign: "center",
      color: "#4B5563",
      marginBottom: 4,
    },
    contactRow: {
      flexDirection: "row",
      justifyContent: "center",
      gap: 12,
      fontSize: baseFontSize - 1,
      color: "#6B7280",
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: baseFontSize + 2,
      fontWeight: "bold",
      borderBottomWidth: 1,
      borderBottomColor: "#000000",
      paddingBottom: 2,
      marginTop: 12,
      marginBottom: 6,
      textTransform: "uppercase",
    },
    entryHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 2,
    },
    bold: { fontWeight: "bold" },
    italic: { fontStyle: "italic" },
    gray: { color: "#6B7280" },
    bulletPoint: {
      flexDirection: "row",
      marginLeft: 10,
      marginBottom: 2,
    },
    bullet: { width: 10 },
    bulletText: { flex: 1 },
    skillRow: {
      flexDirection: "row",
      marginBottom: 2,
    },
    skillCategory: {
      fontWeight: "bold",
      marginRight: 4,
    },
  });

  const fullName = `${content.contact.firstName} ${content.contact.lastName}`.trim();
  const contactItems = [
    content.contact.email,
    content.contact.phone,
    content.contact.location,
    content.contact.linkedin,
  ].filter(Boolean);

  return (
    <Document>
      <Page size={[pageSize.width, pageSize.height]} style={styles.page}>
        {fullName && <Text style={styles.name}>{fullName}</Text>}

        {content.targetJobTitle && (
          <Text style={styles.subtitle}>{content.targetJobTitle}</Text>
        )}

        {contactItems.length > 0 && (
          <View style={styles.contactRow}>
            {contactItems.map((item, i) => (
              <Text key={i}>{item}{i < contactItems.length - 1 ? "  |  " : ""}</Text>
            ))}
          </View>
        )}

        {content.summary && (
          <>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <Text>{content.summary}</Text>
          </>
        )}

        {content.experience.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Work Experience</Text>
            {content.experience.map((exp) => (
              <View key={exp.id} style={{ marginBottom: 8 }}>
                <View style={styles.entryHeader}>
                  <Text style={styles.bold}>{exp.title}</Text>
                  <Text style={styles.gray}>
                    {formatDate(exp.startDate, layout.dateFormat)} —{" "}
                    {exp.current ? "Present" : formatDate(exp.endDate, layout.dateFormat)}
                  </Text>
                </View>
                <Text style={styles.italic}>{exp.company}</Text>
                {exp.description.split("\n").filter(Boolean).map((line, i) => (
                  <View key={i} style={styles.bulletPoint}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.bulletText}>{line.replace(/^[-•]\s*/, "")}</Text>
                  </View>
                ))}
              </View>
            ))}
          </>
        )}

        {content.skills.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Skills</Text>
            {content.skills.map((cat, i) => (
              <View key={i} style={styles.skillRow}>
                <Text style={styles.skillCategory}>{cat.category}:</Text>
                <Text>{cat.items.join(", ")}</Text>
              </View>
            ))}
          </>
        )}

        {content.education.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Education</Text>
            {content.education.map((edu) => (
              <View key={edu.id} style={{ marginBottom: 4 }}>
                <View style={styles.entryHeader}>
                  <Text style={styles.bold}>{edu.degree}</Text>
                  <Text style={styles.gray}>{formatDate(edu.graduationDate, layout.dateFormat)}</Text>
                </View>
                <Text style={styles.italic}>{edu.institution}</Text>
              </View>
            ))}
          </>
        )}

        {content.certifications.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Certifications</Text>
            {content.certifications.map((cert) => (
              <View key={cert.id} style={{ marginBottom: 4 }}>
                <View style={styles.entryHeader}>
                  <Text style={styles.bold}>{cert.name}</Text>
                  <Text style={styles.gray}>{formatDate(cert.date, layout.dateFormat)}</Text>
                </View>
                <Text style={styles.italic}>{cert.issuer}</Text>
              </View>
            ))}
          </>
        )}
      </Page>
    </Document>
  );
}

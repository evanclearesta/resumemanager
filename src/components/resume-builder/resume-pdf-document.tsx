import {
  Document,
  Font,
  Link,
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

// Register Google Fonts using TTF URLs (react-pdf requires TTF, not woff2)
const GOOGLE_FONT_URLS: Record<string, { regular: string; bold: string; italic: string }> = {
  Inter: {
    regular: "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZg.ttf",
    bold: "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYMZg.ttf",
    italic: "https://fonts.gstatic.com/s/inter/v20/UcCM3FwrK3iLTcvneQg7Ca725JhhKnNqk4j1ebLhAm8SrXTc2dthjQ.ttf",
  },
  Roboto: {
    regular: "https://fonts.gstatic.com/s/roboto/v51/KFOMCnqEu92Fr1ME7kSn66aGLdTylUAMQXC89YmC2DPNWubEbWmT.ttf",
    bold: "https://fonts.gstatic.com/s/roboto/v51/KFOMCnqEu92Fr1ME7kSn66aGLdTylUAMQXC89YmC2DPNWuYjammT.ttf",
    italic: "https://fonts.gstatic.com/s/roboto/v51/KFOKCnqEu92Fr1Mu53ZEC9_Vu3r1gIhOszmOClHrs6ljXfMMLoHQiA8.ttf",
  },
  Lato: {
    regular: "https://fonts.gstatic.com/s/lato/v25/S6uyw4BMUTPHvxk.ttf",
    bold: "https://fonts.gstatic.com/s/lato/v25/S6u9w4BMUTPHh6UVew8.ttf",
    italic: "https://fonts.gstatic.com/s/lato/v25/S6u8w4BMUTPHjxswWw.ttf",
  },
  "Open Sans": {
    regular: "https://fonts.gstatic.com/s/opensans/v44/memSYaGs126MiZpBA-UvWbX2vVnXBbObj2OVZyOOSr4dVJWUgsjZ0C4n.ttf",
    bold: "https://fonts.gstatic.com/s/opensans/v44/memSYaGs126MiZpBA-UvWbX2vVnXBbObj2OVZyOOSr4dVJWUgsg-1y4n.ttf",
    italic: "https://fonts.gstatic.com/s/opensans/v44/memQYaGs126MiZpBA-UFUIcVXSCEkx2cmqvXlWq8tWZ0Pw86hd0Rk8ZkaVc.ttf",
  },
  Merriweather: {
    regular: "https://fonts.gstatic.com/s/merriweather/v33/u-4D0qyriQwlOrhSvowK_l5UcA6zuSYEqOzpPe3HOZJ5eX1WtLaQwmYiScCmDxhtNOKl8yDr3icqEw.ttf",
    bold: "https://fonts.gstatic.com/s/merriweather/v33/u-4D0qyriQwlOrhSvowK_l5UcA6zuSYEqOzpPe3HOZJ5eX1WtLaQwmYiScCmDxhtNOKl8yDrOSAqEw.ttf",
    italic: "https://fonts.gstatic.com/s/merriweather/v33/u-4B0qyriQwlOrhSvowK_l5-eTxCVx0ZbwLvKH2Gk9hLmp0v5yA-xXPqCzLvPee1XYk_XSf-FmTCUF3w.ttf",
  },
};

// Disable hyphenation so words wrap whole instead of breaking with "-"
Font.registerHyphenationCallback((word) => [word]);

for (const [family, urls] of Object.entries(GOOGLE_FONT_URLS)) {
  Font.register({
    family,
    fonts: [
      { src: urls.regular, fontWeight: "normal", fontStyle: "normal" },
      { src: urls.bold, fontWeight: "bold", fontStyle: "normal" },
      { src: urls.italic, fontWeight: "normal", fontStyle: "italic" },
    ],
  });
}

// Map font names to react-pdf compatible families
function resolveFontFamily(font: string): string {
  const builtInMap: Record<string, string> = {
    Helvetica: "Helvetica",
    Arial: "Helvetica",
    "Times New Roman": "Times-Roman",
    Georgia: "Times-Roman",
    Courier: "Courier",
  };
  if (builtInMap[font]) return builtInMap[font];
  if (GOOGLE_FONT_URLS[font]) return font;
  return "Helvetica";
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
  const bodyFont = resolveFontFamily(layout.fonts.body);
  const titleFont = resolveFontFamily(layout.fonts.title);
  const headingFont = resolveFontFamily(layout.fonts.heading);

  const styles = StyleSheet.create({
    page: {
      paddingTop: margins.top,
      paddingRight: margins.right,
      paddingBottom: margins.bottom,
      paddingLeft: margins.left,
      fontFamily: bodyFont,
      fontSize: baseFontSize,
      lineHeight,
    },
    name: {
      fontSize: baseFontSize * 2,
      fontFamily: titleFont,
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 12,
    },
    contactRow: {
      flexDirection: "row",
      justifyContent: "center",
      flexWrap: "wrap",
      fontSize: baseFontSize - 1,
      color: "#6B7280",
      marginBottom: 16,
    },
    contactLink: {
      color: "#6B7280",
      textDecoration: "none",
    },
    separator: {
      marginHorizontal: 6,
    },
    sectionTitle: {
      fontSize: baseFontSize + 2,
      fontFamily: headingFont,
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
      marginBottom: 2,
    },
    skillCategory: {
      fontWeight: "bold",
    },
  });

  const fullName = `${content.contact.firstName} ${content.contact.lastName}`.trim();

  // Build contact items with optional links
  const contactElements: { text: string; href?: string }[] = [];

  if (content.targetJobTitle) {
    contactElements.push({ text: content.targetJobTitle });
  }
  if (content.contact.email) {
    contactElements.push({ text: content.contact.email, href: `mailto:${content.contact.email}` });
  }
  if (content.contact.phone) {
    contactElements.push({ text: content.contact.phone });
  }
  if (content.contact.location) {
    contactElements.push({ text: content.contact.location });
  }
  if (content.contact.linkedin) {
    const linkedinUrl = content.contact.linkedin.startsWith("http")
      ? content.contact.linkedin
      : `https://${content.contact.linkedin}`;
    contactElements.push({ text: content.contact.linkedin, href: linkedinUrl });
  }

  return (
    <Document>
      <Page size={[pageSize.width, pageSize.height]} style={styles.page}>
        {fullName && <Text style={styles.name}>{fullName}</Text>}

        {contactElements.length > 0 && (
          <View style={styles.contactRow}>
            {contactElements.map((item, i) => (
              <Text key={i}>
                {item.href ? (
                  <Link src={item.href} style={styles.contactLink}>{item.text}</Link>
                ) : (
                  item.text
                )}
                {i < contactElements.length - 1 && (
                  <Text style={styles.separator}> | </Text>
                )}
              </Text>
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
                  <Text style={styles.bold}>{exp.company}</Text>
                  {exp.country ? <Text style={styles.gray}>{exp.country}</Text> : null}
                </View>
                <View style={styles.entryHeader}>
                  <Text>{exp.title}</Text>
                  <Text style={styles.gray}>
                    {formatDate(exp.startDate, layout.dateFormat)} —{" "}
                    {exp.current ? "Present" : formatDate(exp.endDate, layout.dateFormat)}
                  </Text>
                </View>
                {exp.description.split("\n").filter(Boolean).map((line, i) => (
                  <View key={i} style={styles.bulletPoint} wrap={false}>
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
              <Text key={i} style={styles.skillRow}>
                <Text style={styles.skillCategory}>{cat.category}:  </Text>
                <Text>{cat.items.join(", ")}</Text>
              </Text>
            ))}
          </>
        )}

        {content.education.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Education</Text>
            {content.education.map((edu) => (
              <View key={edu.id} style={{ marginBottom: 4 }}>
                <View style={styles.entryHeader}>
                  <Text style={styles.bold}>{edu.institution}</Text>
                  {edu.country ? <Text style={styles.gray}>{edu.country}</Text> : null}
                </View>
                <View style={styles.entryHeader}>
                  <Text>{edu.degree}</Text>
                  <Text style={styles.gray}>{formatDate(edu.graduationDate, layout.dateFormat)}</Text>
                </View>
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

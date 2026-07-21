/**
 * Generates the full HTML for a Sales Offer PDF directly server-side,
 * bypassing any auth middleware. Used by the PDF generation route.
 */

const USD_TO_AED = 3.6725

function formatNum(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

export function generateSalesOfferHtml(proposal: any, baseUrl: string = ''): string {
  const snap = proposal.snapshot as any

  // Calculate prices
  const basePrice = Number(snap.unit.price)
  const discountAmount = proposal.discountPercent ? basePrice * (proposal.discountPercent / 100) : 0
  const finalPriceNum = proposal.customPrice ? Number(proposal.customPrice) : (basePrice - discountAmount)
  const finalPriceUSD = finalPriceNum
  const finalPriceAED = finalPriceNum * USD_TO_AED

  // Safe parse selectedImages
  let selectedImages: string[] = []
  const rawImgs = proposal.selectedImages
  if (Array.isArray(rawImgs)) {
    selectedImages = rawImgs as string[]
  } else if (typeof rawImgs === 'string') {
    try { selectedImages = JSON.parse(rawImgs) } catch {}
  }
  if (!Array.isArray(selectedImages)) selectedImages = []

  const customPaymentPlan: { milestone: string, percentage: number, date: string }[] =
    (snap.customPaymentPlan && Array.isArray(snap.customPaymentPlan)) ? snap.customPaymentPlan : []

  const amenities: string[] = snap.amenities || []
  const consultantName = proposal.createdBy?.name || ''
  const consultantPhone = proposal.createdBy?.phone || ''
  const completionDate = snap.project.completionDate
    ? new Date(snap.project.completionDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : ''

  const headerHtml = `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:36px;">
      <div style="font-size:22px;font-weight:800;letter-spacing:0.05em;color:#1a1a1a;">SALES OFFER</div>
      <div style="display:flex;align-items:center;gap:10px;">
        <img src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyBpZD0iTGF5ZXJfMiIgZGF0YS1uYW1lPSJMYXllciAyIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0NjcuODQgMTg4Ljg0Ij4KICA8ZGVmcz4KICAgIDxzdHlsZT4KICAgICAgLmNscy0xIHsKICAgICAgICBmaWxsOiAjMjEyMTJmOwogICAgICB9CgogICAgICAuY2xzLTIgewogICAgICAgIGZpbGw6ICNjYjJjMzk7CiAgICAgIH0KICAgIDwvc3R5bGU+CiAgPC9kZWZzPgogIDxnIGlkPSJMYXllcl8xLTIiIGRhdGEtbmFtZT0iTGF5ZXIgMSI+CiAgICA8cGF0aCBjbGFzcz0iY2xzLTIiIGQ9Ik0xMTUuMzUsNzYuMVY5LjA5Yy00NC40OCwyLjQ4LTc5Ljk1LDM5Ljg2LTc5Ljk1LDg1LjMyczM1LjQ3LDgyLjg2LDc5Ljk1LDg1LjMzdi03Ni44NmgtNDcuMzZ2LTguOTFoNTYuMjZ2OTQuODdsLTQuNDYtLjAyYy0uNiwwLTEuMi0uMDEtMS44LS4wM0gwVjUxLjY3aDguOTJ2MTI4LjI5aDcxLjYzYy0zMS45LTE1LjA3LTU0LjA1LTQ3Ljc4LTU0LjA1LTg1LjU1UzQ4LjcxLDIzLjg1LDgwLjY3LDguODFIOC45MnYyNC43OEgwVi4wMWgxMjQuMjVzMCw3Ni4wOSwwLDc2LjA5aC04LjlaIi8+CiAgICA8Zz4KICAgICAgPGc+CiAgICAgICAgPHBhdGggY2xhc3M9ImNscy0xIiBkPSJNMTc2LjY3LDYyLjloLTguNDFWMTguMzhoOC40MXY0NC41MVoiLz4KICAgICAgICA8cGF0aCBjbGFzcz0iY2xzLTEiIGQ9Ik0yMjUuMjYsNjIuOWgtOC42MWwtMjIuMTYtMzIuNzZ2MzIuNzZoLTcuODhWMTguMzhoOC43NGwyMS44OSwzMi44MlYxOC4zOGg4LjAxdjQ0LjUxWiIvPgogICAgICAgIDxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTIzOC4zMywxOC4zOGwxMi4wMSwzNS4yLDEyLjI4LTM1LjJoOC40OGwtMTYuMjksNDQuNTFoLTkuMjhsLTE1Ljk1LTQ0LjUxaDguNzRaIi8+CiAgICAgICAgPHBhdGggY2xhc3M9ImNscy0xIiBkPSJNMzA5Ljg4LDI0Ljk1aC0yNS45NnYxMS44MmgyNC4wOXY2LjMxaC0yNC4wOXYxMy4xM2gyNi4zNnY2LjY5aC0zNC42NFYxOC4zOGgzNC4yNHY2LjU2WiIvPgogICAgICAgIDxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTM0My45OCwzMS41MWMtLjQ5LTUuMjEtMy45NC03LjgxLTEwLjM0LTcuODEtMi44NSwwLTUuMDcuNTUtNi42NywxLjY2LTEuNiwxLjEtMi40LDIuNjItMi40LDQuNTMsMCwxLjc5LjU5LDMuMDIsMS43NywzLjY5LDEuMTguNjcsMy43OSwxLjQ4LDcuODQsMi40NCwxLjA3LjI5LDEuODkuNSwyLjQ3LjYyLDUuMjksMS4yNSw4LjksMi4zOCwxMC44MSwzLjM4LDQuMjMsMi4xMyw2LjM0LDUuNDQsNi4zNCw5Ljk0LDAsMS45Ni0uMzYsMy43My0xLjA3LDUuMzEtLjcxLDEuNTgtMS42NywyLjkxLTIuODcsMy45Ny0xLjIsMS4wNi0yLjYyLDEuOTUtNC4yNywyLjY2LTEuNjUuNzEtMy4zNiwxLjIyLTUuMTQsMS41My0xLjTrLjMxLTMuNjMuNDctNS41NC40Ny01Ljk2LDAtMTAuNzktMS4zMy0xNC40OC00LTMuNjktMi42Ny01LjU0LTYuNTgtNS41NC0xMS43NWg4LjIxYzAsMy4yNSwxLjEzLDUuNjYsMy40LDcuMjJzNS4yMywyLjM0LDguODgsMi4zNGMzLjIsMCw1LjcxLS42MSw3LjUxLTEuODQsMS44LTEuMjMsMi43LTIuOTUsMi43LTUuMTYsMC0xLjQyLS40OC0yLjU3LTEuNDMtMy40N3MtMS45OS0xLjUzLTMuMS0xLjkxLTMuMDUtLjktNS44MS0xLjU2Yy0uMzEtLjA4LS41Ni0uMTUtLjczLS4xOS01LjkyLTEuNDItOS44MS0yLjU4LTExLjY4LTMuNS0zLjg3LTEuODgtNS45NC00Ljc3LTYuMjEtOC42OXYtLjg4YzAtMy45NiwxLjU5LTcuMTIsNC43Ny05LjQ3LDMuMTgtMi4zNSw3LjQ0LTMuNTMsMTIuNzgtMy41M3M5LjM3LDEuMTUsMTIuNjEsMy40NGMzLjI1LDIuMjksNC45Niw1LjgxLDUuMTQsMTAuNTZoLTcuOTRaIi8+CiAgICAgICAgPHBhdGggY2xhc3M9ImNscy0xIiBkPSJNMzk1LjEsMjUuMTRoLTE1LjE1djM3Ljc2aC04LjM0VjI1LjE0aC0xNS4xNXYtNi43NWgzOC42NHY2Ljc1WiIvPgogICAgICAgIDxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTIwOS45MSwxMjQuNjFoLTUuMzRsLTEuMjctNS4zMWMtMy43OCw0LjI1LTguNzIsNi4zOC0xNC44Miw2LjM4LTYuNjcsMC0xMi4wOS0yLjEyLTE2LjI1LTYuMzhzLTYuMjQtOS43OS02LjI0LTE2LjYzLDIuMDktMTIuMzEsNi4yNy0xNi43OWM0LjE4LTQuNDgsOS44My02LjcyLDE2Ljk1LTYuNzIsNS4xNiwwLDkuNjcsMS4zNSwxMy41Miw0LjA2czYuMDQsNi40LDYuNTcsMTEuMDdoLTguMDhjLS40OS0yLjY3LTEuODEtNC43Ni0zLjk3LTYuMjgtMi4xNi0xLjUyLTQuODYtMi4yOC04LjExLTIuMjgtNC41OCwwLTguMTksMS41LTEwLjgxLDQuNS0yLjYyLDMtMy45NCw3LjExLTMuOTQsMTIuMzFzMS4zMiw5LjM3LDMuOTcsMTIuMzVjMi42NSwyLjk4LDYuMzMsNC40NywxMS4wNSw0LjQ3LDQuMTQsMCw3LjMzLTEuMjEsOS41OC0zLjYzczMuMzctNS40LDMuMzctOC45NGgtMTIuODF2LTZoMjAuMzZ2MjMuODJaIi8+CiAgICAgICAgPHBhdGggY2xhc3M9ImNscy0xIiBkPSJNMjUzLjAyLDg2LjY2aC0yNS45NnYxMS44MWgyNC4wOXY2LjMxaC0yNC4wOXYxMy4xM2gyNi4zNnY2LjY5aC0zNC42NHYtNDQuNTFoMzQuMjR2Ni41NloiLz4KICAgICAgICA8cGF0aCBjbGFzcz0iY2xzLTEiIGQ9Ik0yOTcuNzYsODUuNWM0LjIxLDQuMzEsNi4zMSw5LjkzLDYuMzEsMTYuODVzLTIuMTEsMTIuNTQtNi4zNCwxNi44NWMtNC4yMyw0LjMxLTkuNzIsNi40Ny0xNi40OSw2LjQ3cy0xMi4zMS0yLjE1LTE2LjUyLTYuNDRjLTQuMi00LjI5LTYuMzEtOS45Mi02LjMxLTE2Ljg4czIuMDYtMTIuMzMsNi4xNy0xNi43MmM0LjEyLTQuNCw5LjcxLTYuNiwxNi43OS02LjZzMTIuMTgsMi4xNiwxNi4zOCw2LjQ3Wk0yNzAuNzcsOTAuMTNjLTIuNjIsMy4wMi0zLjk0LDcuMDUtMy45NCwxMi4xczEuMyw5LjI3LDMuOSwxMi4zMmMyLjYsMy4wNCw2LjE1LDQuNTYsMTAuNjUsNC41NnM3Ljc4LTEuNTMsMTAuMzgtNC42YzIuNi0zLjA2LDMuOS03LjE0LDMuOS0xMi4yMnMtMS4zLTkuMTQtMy45LTEyLjE2Yy0yLjYtMy4wMi02LjExLTQuNTMtMTAuNTEtNC41M3MtNy44NSwxLjUxLTEwLjQ4LDQuNTNaIi8+CiAgICAgICAgPHBhdGggY2xhc3M9ImNscy0xIiBkPSJNMzM0LjAzLDgwLjFjNC43MiwwLDguNTcuOTksMTEuNTUsMi45NywyLjk4LDEuOTgsNC40Nyw1LjEyLDQuNDcsOS40MSwwLDIuNjctLjY5LDQuOTUtMi4wNyw2Ljg1LTEuMzgsMS45LTMuMzIsMy4yNi01LjgxLDQuMDksMS4xNi4yNSwyLjE2LjYyLDMsMS4xMi44NS41LDEuNSwxLjA0LDEuOTcsMS42Mi40Ny41OC44NiwxLjMzLDEuMTcsMi4yNXMuNTIsMS43Mi42MywyLjQxYy4xMS42OS4yMSwxLjU5LjMsMi43Mi4wNC4yOS4xLjg1LjE3LDEuNjkuMDcuODMuMTEsMS4zOS4xMywxLjY2cy4wNy43NC4xMywxLjQxYy4wNy42Ny4xMiwxLjE0LjE3LDEuNDEuMDQuMjcuMTIuNjcuMjMsMS4xOS4xMS41Mi4yMS45Mi4zLDEuMTkuMDkuMjcuMi41OC4zMy45NC4xMy4zNS4yOS42Ni40Ny45MS4xOC4yNS4zOC40OC42LjY5aC04Ljk0Yy0uMTMtLjE3LS4yNi0uMzYtLjM3LS41OS0uMTEtLjIzLS4yMS0uNDgtLjMtLjc1LS4wOS0uMjctLjE2LS41Mi0uMi0uNzUtLjA0LS4yMy0uMS0uNTQtLjE3LS45NC0uMDctLjQtLjEtLjcyLS4xLS45N2wtLjEzLTEuMTItLjEzLTEuMTNjMC0uMjUtLjAyLS42OS0uMDctMS4zMS0uMDQtLjYyLS4wNy0xLjA2LS4wNy0xLjMxLS4yMi0zLjYzLTEuMDMtNi4xMi0yLjQ0LTcuNDdzLTQuMDYtMi4wMy03Ljk4LTIuMDNoLTExLjA4djE4LjM4aC04LjI4di00NC41MWgyMi40OVpNMzE5LjgyLDEwMC40MWgxMS4wMWMxLjYsMCwyLjk2LS4wOCw0LjA3LS4yNSwxLjExLS4xNywyLjI0LS40NywzLjM3LS45MXMyLTEuMTYsMi42LTIuMTYuOS0yLjI3LjktMy44MWMwLTEuNDItLjI3LTIuNTktLjgtMy41My0uNTMtLjk0LTEuMy0xLjY0LTIuMy0yLjA5LTEtLjQ2LTIuMDItLjc3LTMuMDctLjk0cy0yLjI4LS4yNS0zLjctLjI1aC0xMi4wOHYxMy45NFoiLz4KICAgICAgICA8cGF0aCBjbGFzcz0iY2xzLTEiIGQ9Ik00MDAuMywxMjQuNjFoLTUuMzRsLTEuMjctNS4zMWMtMy43OCw0LjI1LTguNzIsNi4zOC0xNC44Miw2LjM4LTYuNjcsMC0xMi4wOS0yLjEyLTE2LjI1LTYuMzhzLTYuMjQtOS43OS02LjI0LTE2LjYzLDIuMDktMTIuMzEsNi4yNy0xNi43OWM0LjE4LTQuNDgsOS44My02LjcyLDE2Ljk1LTYuNzIsNS4xNiwwLDkuNjcsMS4zNSwxMy41Miw0LjA2czYuMDQsNi40LDYuNTcsMTEuMDdoLTguMDhjLS40OS0yLjY3LTEuODEtNC43Ni0zLjk3LTYuMjgtMi4xNi0xLjUyLTQuODYtMi4yOC04LjExLTIuMjgtNC41OCwwLTguMTksMS41LTEwLjgxLDQuNS0yLjYyLDMtMy45NCw3LjExLTMuOTQsMTIuMzFzMS4zMiw5LjM3LDMuOTcsMTIuMzVjMi42NSwyLjk4LDYuMzMsNC40NywxMS4wNSw0LjQ3LDQuMTQsMCw3LjMzLTEuMjEsOS41OC0zLjYzczMuMzctNS40LDMuMzctOC45NGgtMTIuODF2LTZoMjAuMzZ2MjMuODJaIi8+CiAgICAgICAgPHBhdGggY2xhc3M9ImNscy0xIiBkPSJNNDE3LjcyLDEyNC42MWgtOC40MXYtNDQuNTFoOC40MXY0NC41MVoiLz4KICAgICAgICA8cGF0aCBjbGFzcz0iY2xzLTEiIGQ9Ik00NjcuODQsMTI0LjYxaC04Ljk0bC00LjU0LTExLjgyaC0xOC44MmwtNC42NywxMS44MmgtOC42MWwxOC4zNS00NC41N2g4Ljg4bDE4LjM1LDQ0LjU3Wk00NDUuMDgsODguMTZsLTcuNDEsMTguNzVoMTQuNDhsLTcuMDctMTguNzVaIi8+CiAgICAgIDwvZz4KICAgICAgPGc+CiAgICAgICAgPHBhdGggY2xhc3M9ImNscy0xIiBkPSJNMTczLjI2LDE0MS45MnYxOC40MmMwLDIuODQuNjYsNC45MiwxLjk3LDYuMjMsMS4zMSwxLjMxLDMuNDYsMS45Nyw2LjQ0LDEuOTdzNS4yMy0uNjcsNi41LTIuMDFjMS4yNy0xLjM0LDEuOTEtMy40LDEuOTEtNi4xOXYtMTguNDJoNC4xNnYxNy4zOWMwLDQuMjctLjk1LDcuNC0yLjg1LDkuNDFzLTUuMTQsMy4wMS05LjcyLDMuMDEtNy42NC0uOTgtOS42MS0yLjkzLTIuOTYtNC45OC0yLjk2LTkuMDh2LTE3LjhoNC4xNloiLz4KICAgICAgICA8cGF0aCBjbGFzcz0iY2xzLTEiIGQ9Ik0yMjYuMiwxNzEuMTNoLTQuNmwtMy40Ni04Ljk0aC0xMy4wOWwtMy41NSw4Ljk0aC00LjM4bDEyLjI2LTI5LjJoNC42NGwxMi4xNywyOS4yWk0yMTEuNjIsMTQ1LjYxbC01LjM5LDEzLjQ5aDEwLjY5bC01LjMtMTMuNDlaIi8+CiAgICAgICAgPHBhdGggY2xhc3M9ImNscy0xIiBkPSJNMjUwLjksMTQ1LjI5aC0xNy40N3Y5LjE1aDE2LjMzdjMuMjRoLTE2LjMzdjEwLjA5aDE3LjY5djMuMzZoLTIxLjgxdi0yOS4yaDIxLjU5djMuMzZaIi8+CiAgICAgIDwvZz4KICAgIDwvZz4KICA8L2c+Cjwvc3ZnPg==" alt="Invest Georgia" style="height:36px;width:auto;object-fit:contain;" />
      </div>
    </div>`

  // Payment plan rows
  const paymentPlanRows = customPaymentPlan.length > 0
    ? customPaymentPlan.map((m, i) => {
        const amtUSD = (finalPriceUSD * m.percentage) / 100
        const amtAED = amtUSD * USD_TO_AED
        return `
          <tr style="border-bottom:${i < customPaymentPlan.length - 1 ? '1px solid #eee' : 'none'}">
            <td style="padding:10px 14px;color:#666;">${i + 1}</td>
            <td style="padding:10px 14px;font-weight:500;">${m.milestone}</td>
            <td style="padding:10px 14px;text-align:center;">${m.percentage}%</td>
            <td style="padding:10px 14px;text-align:center;color:#555;">${m.date}</td>
            <td style="padding:10px 14px;text-align:right;">${formatNum(amtUSD)}</td>
            <td style="padding:10px 14px;text-align:right;">${formatNum(amtAED)}</td>
          </tr>`
      }).join('')
    : `<tr><td colspan="6" style="padding:60px 14px;text-align:center;color:#aaa;font-style:italic;">No payment plan milestones entered</td></tr>`

  // Amenities rows (3 per row)
  const amenityRows = amenities.length > 0 ? (() => {
    let rows = ''
    for (let r = 0; r < Math.ceil(amenities.length / 3); r++) {
      const isLast = r === Math.ceil(amenities.length / 3) - 1
      rows += `<tr style="border-bottom:${isLast ? 'none' : '1px solid #eee'};">`
      for (let c = 0; c < 3; c++) {
        const a = amenities[r * 3 + c] || ''
        rows += `<td style="padding:10px 14px;width:33%;">${a}</td>`
      }
      rows += '</tr>'
    }
    return rows
  })() : ''

  // Floor plan
  const floorPlanHtml = snap.unit?.floorPlanUrl
    ? `<div style="width:100%;height:360px;border:1px solid #ddd;border-radius:6px;overflow:hidden;margin-bottom:36px;background:#f0f0ef;">
         <img src="${snap.unit.floorPlanUrl}" style="width:100%;height:100%;object-fit:contain;" />
       </div>`
    : `<div style="width:100%;height:200px;border:1px solid #ddd;border-radius:6px;display:flex;align-items:center;justify-content:center;background:#f0f0ef;margin-bottom:36px;color:#aaa;font-size:13px;font-style:italic;">No floor plan image available</div>`

  // Gallery page
  const galleryImages = selectedImages.map(url =>
    `<div style="aspect-ratio:16/9;overflow:hidden;border-radius:6px;border:1px solid #ddd;background:#f0f0ef;">
       <img src="${url}" style="width:100%;height:100%;object-fit:cover;" />
     </div>`
  ).join('')

  const galleryPage = selectedImages.length > 0 ? `
    <div style="width:794px;min-height:1123px;background:#FAFAF8;padding:60px 64px;font-family:'Helvetica Neue',Arial,sans-serif;color:#1a1a1a;box-sizing:border-box;page-break-before:always;">
      ${headerHtml}
      <h2 style="font-size:16px;font-weight:700;margin-bottom:20px;border-bottom:1.5px solid #1a1a1a;padding-bottom:10px;">Property Gallery</h2>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
        ${galleryImages}
      </div>
    </div>` : ''

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sales Offer - ${proposal.customer.name}</title>
  ${baseUrl ? `<base href="${baseUrl}">` : ''}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #f0eeea; }
    @media print {
      @page { size: A4; margin: 0; }
      body { background: white; }
      .page { page-break-after: always; }
      .page:last-child { page-break-after: auto; }
    }
  </style>
</head>
<body>

<!-- PAGE 1 -->
<div class="page" style="width:794px;min-height:1123px;background:#FAFAF8;padding:60px 64px;font-family:'Helvetica Neue',Arial,sans-serif;color:#1a1a1a;box-sizing:border-box;">
  ${headerHtml}

  <!-- Salutation -->
  <div style="margin-bottom:20px;">
    <div style="font-size:16px;font-weight:700;">Dear&nbsp;&nbsp;&nbsp;${proposal.customer.name}</div>
    <p style="font-size:12px;color:#444;margin-top:8px;line-height:1.7;">
      ${proposal.customerMessage || 'Taking into consideration your preferences and the key points we discussed, I have carefully selected the following projects that best match your requirements and offer strong investment potential.'}
    </p>
  </div>

  <!-- Project Table -->
  <div style="margin-bottom:20px;">
    <table style="width:100%;border-collapse:collapse;font-size:12px;">
      <thead>
        <tr style="border-bottom:1.5px solid #1a1a1a;">
          <th style="text-align:center;padding:8px 6px;font-weight:400;color:#666;width:25%;">Project</th>
          <th style="text-align:center;padding:8px 6px;font-weight:400;color:#666;width:25%;">Tower/Block</th>
          <th style="text-align:center;padding:8px 6px;font-weight:400;color:#666;width:25%;">Unit</th>
          <th style="text-align:center;padding:8px 6px;font-weight:400;color:#666;width:25%;">Estimated Completion date</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="text-align:center;padding:12px 6px;font-weight:500;">${snap.project.name}</td>
          <td style="text-align:center;padding:12px 6px;">${snap.unit.towerBlock || '—'}</td>
          <td style="text-align:center;padding:12px 6px;">${snap.unit.unitNumber}</td>
          <td style="text-align:center;padding:12px 6px;">${completionDate || '—'}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Pricing Table -->
  <div style="margin-bottom:20px;">
    <table style="width:100%;border-collapse:collapse;font-size:12px;">
      <thead>
        <tr style="border-bottom:1.5px solid #1a1a1a;">
          <th style="text-align:center;padding:8px 6px;font-weight:400;color:#666;width:33%;">Selling Price USD</th>
          <th style="text-align:center;padding:8px 6px;font-weight:400;color:#666;width:33%;">Selling Price AED</th>
          <th style="text-align:center;padding:8px 6px;font-weight:400;color:#666;width:33%;">ROI</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="text-align:center;padding:12px 6px;font-weight:500;">${formatNum(finalPriceUSD)}</td>
          <td style="text-align:center;padding:12px 6px;">${formatNum(finalPriceAED)}</td>
          <td style="text-align:center;padding:12px 6px;">${snap.project.roi ? snap.project.roi + '%' : '—'}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Disclaimer -->
  <div style="margin-bottom:28px;font-size:11px;color:#555;">
    <div>• Prices and availability are subject to change without prior notice.</div>
    <div>• Completion dates are estimated and may be revised by the developer when required.</div>
  </div>

  <!-- Payment Plan -->
  <div>
    <div style="display:flex;align-items:baseline;gap:16px;margin-bottom:12px;">
      <span style="font-size:15px;font-weight:700;">Standard Payment Plan</span>
      ${snap.paymentPlans?.length ? `<span style="font-size:13px;color:#555;">${snap.paymentPlans.map((p: any) => p.name).join(', ')}</span>` : ''}
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:12px;border:1px solid #ddd;border-radius:6px;">
      <thead>
        <tr style="border-bottom:1.5px solid #ccc;background:#f9f9f7;">
          <th style="text-align:left;padding:10px 14px;font-weight:500;width:6%;">#</th>
          <th style="text-align:left;padding:10px 14px;font-weight:500;width:32%;">Milestone</th>
          <th style="text-align:center;padding:10px 14px;font-weight:500;width:10%;">%</th>
          <th style="text-align:center;padding:10px 14px;font-weight:500;width:20%;">Date</th>
          <th style="text-align:right;padding:10px 14px;font-weight:500;width:16%;">Amount USD</th>
          <th style="text-align:right;padding:10px 14px;font-weight:500;width:16%;">Amount AED</th>
        </tr>
      </thead>
      <tbody>
        ${paymentPlanRows}
      </tbody>
    </table>
  </div>
</div>

<!-- PAGE 2 -->
<div class="page" style="width:794px;min-height:1123px;background:#FAFAF8;padding:60px 64px;font-family:'Helvetica Neue',Arial,sans-serif;color:#1a1a1a;box-sizing:border-box;page-break-before:always;">
  ${headerHtml}

  <!-- Project + Developer -->
  <div style="display:flex;align-items:baseline;gap:20px;margin-bottom:24px;">
    <h2 style="font-size:22px;font-weight:800;margin:0;">${snap.project.name}</h2>
    ${snap.developer?.name ? `<span style="font-size:14px;color:#555;font-weight:500;">${snap.developer.name}</span>` : ''}
  </div>

  <!-- Amenities -->
  ${amenities.length > 0 ? `
  <div style="margin-bottom:28px;">
    <table style="width:100%;border-collapse:collapse;font-size:12px;border:1px solid #ddd;">
      <thead>
        <tr style="border-bottom:1.5px solid #ccc;background:#f9f9f7;">
          <th colspan="3" style="text-align:left;padding:10px 14px;font-weight:500;color:#666;">Amenities</th>
        </tr>
      </thead>
      <tbody>${amenityRows}</tbody>
    </table>
  </div>` : ''}

  <!-- Unit Condition -->
  ${snap.unit?.condition ? `
  <div style="display:flex;gap:16px;align-items:baseline;margin-bottom:20px;">
    <span style="font-size:14px;font-weight:700;">Unit Condition</span>
    <span style="font-size:14px;color:#555;">${snap.unit.condition}</span>
  </div>` : ''}

  <!-- Floor Plan -->
  ${floorPlanHtml}

  <!-- Contact -->
  <div style="border-top:1.5px solid #1a1a1a;padding-top:16px;">
    <div style="font-size:16px;font-weight:800;margin-bottom:8px;">Contact</div>
    <div style="display:flex;justify-content:space-between;align-items:flex-end;">
      <div style="font-size:12px;line-height:2;">
        ${consultantName ? `<div>Sales Consultant: ${consultantName}</div>` : ''}
        ${consultantPhone ? `<div>Contact: ${consultantPhone}</div>` : ''}
        <div>Email: info@investgeorgia.ae</div>
      </div>
      <div style="font-size:13px;font-weight:600;">www.investinggeorgia.ae</div>
    </div>
  </div>
</div>

<!-- PAGE 3 (Gallery) -->
${galleryPage}

</body>
</html>`
}

import type { AppCalibration, VoucherFormState } from '../types';
import {
  amountToIndianCurrencyWords,
  formatAmountDisplay,
  formatDateDDMMYYYY,
} from '../utils/formatters';
import { IndiaPostLogo } from './IndiaPostLogo';

interface Acg17SheetProps {
  form: VoucherFormState;
  calibration: AppCalibration;
  id?: string;
}

export function Acg17Sheet({
  form,
  calibration,
  id = 'acg17-sheet',
}: Acg17SheetProps) {
  const parsedAmt = parseFloat(form.amount);
  const hasAmount = form.amount !== '' && !Number.isNaN(parsedAmt) && parsedAmt > 0;
  const formattedAmt = hasAmount ? formatAmountDisplay(parsedAmt) : '';
  const amountWords = hasAmount ? amountToIndianCurrencyWords(parsedAmt) : '';
  const dateFormatted = formatDateDDMMYYYY(form.dateISO);

  const paperClasses = [
    'paper',
    calibration.paperSize === 'a5' ? 'size-a5' : '',
    calibration.printMode === 'overlay' ? 'overlay-mode' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div id={id} className={paperClasses}>
      <div className="acg17-inner">
        {/* UPPER SECTION: Top Header, Elevated India Post Logo & Voucher Particulars */}
        <div>
          <div className="acg17-header-grid">
            {/* Top-Left: A.C.G.- 17 & India Post Logo positioned slightly upper for clear visibility */}
            <div className="acg17-left-col">
              <div className="static-label acg17-form-code">A.C.G.- 17</div>
              <div className="static-box acg17-logo-wrap">
                <IndiaPostLogo variant="form" />
              </div>
            </div>

            {/* Center: Please Pay Rs., Amount in Words & Department Title */}
            <div className="acg17-center-col">
              <div>
                <div className="acg17-please-pay">
                  <span className="static-label">Please Pay Rs. &nbsp;</span>
                  <span className="dyn-val">{formattedAmt}</span>
                </div>
                <div className="dyn-val acg17-top-words">{amountWords}</div>
              </div>

              <div className="static-label acg17-dept-title">
                DEPARTMENT OF POSTS - INDIA
              </div>
            </div>

            {/* Right balance column so center text aligns to exact page center */}
            <div aria-hidden="true" />
          </div>

          {/* Full-width Statutory Subtitle Block (cleanly below logo) */}
          <div className="acg17-subtitle-block">
            <div className="static-label acg17-subtitle-line">
              (See Note below Rules 6 (b) of Appendix II to Posts and Telegraphs Financial Handbook Volume I)
            </div>
            <div className="static-label acg17-subtitle-line">
              2nd Edition 2nd Reprinting)
            </div>
            <div className="static-label acg17-receipt-heading">/Receipt</div>
          </div>

          {/* VOUCHER DATA ROWS */}
          <div className="acg17-fields">
            {/* Row 1: The <Date> & Voucher No <No> */}
            <div className="acg17-row-flex">
              <div className="acg17-col-date">
                <span className="static-label acg17-label-bold">The</span>
                <span className="dyn-val acg17-val-date">{dateFormatted}</span>
              </div>
              <div className="acg17-col-vch">
                <span className="static-label acg17-label-bold">Voucher No</span>
                <span className="dyn-val acg17-val-vch">
                  {form.receiptNo.trim()}
                </span>
              </div>
            </div>

            {/* Row 2: Received from */}
            <div className="acg17-row-flex acg17-row-mt">
              <span className="static-label acg17-label-bold acg17-nowrap">
                Received from
              </span>
              <span className="dyn-val acg17-val-from">
                {form.receivedFrom.trim()}
              </span>
            </div>

            {/* Row 3: The Sum of Rupees */}
            <div className="acg17-row-flex acg17-row-mt">
              <span className="static-label acg17-label-bold acg17-nowrap">
                The Sum of Rupees
              </span>
              <span className="dyn-val acg17-val-words">{amountWords}</span>
            </div>

            {/* Row 4: On Account of */}
            <div className="acg17-row-mt">
              <div className="static-label acg17-label-bold">On Account of</div>
              <div className="dyn-val acg17-val-account">
                {form.onAccountOf.trim()}
              </div>
            </div>

            {/* Row 5: /Rs. <Amount> */}
            <div className="acg17-rs-row">
              <span className="static-label acg17-label-bold">/Rs.</span>
              <span className="dyn-val acg17-val-rs">{formattedAmt}</span>
            </div>
          </div>
        </div>

        {/* MIDDLE SECTION: Witnessed Payment, Rev Stamp Text (no box/logo), Signature Line, Notes & Certificate 1 */}
        <div>
          <div className="acg17-witness-top">
            <div className="static-label acg17-label-bold">
              Witnessed Payment
            </div>
            <div className="static-label acg17-rev-stamp-text">Rev Stamp</div>
          </div>

          {/* Signature of Witness / Signature of Payee Row */}
          <div className="witness-rule">
            <div className="static-label acg17-sig-witness">
              Signature of Witness
            </div>
            <div className="static-label acg17-sig-payee">
              Signature of Payee
            </div>
          </div>

          {/* STATUTORY NOTES & CERTIFICATE 1 */}
          <div className="acg17-notes">
            <div className="note-rule">
              <span className="static-label">
                Note :- If the receipt be not written or not signed in English/Hindi the whole of the portion not in English/Hindi must be translated by the Paying Officer. A person signing such receipt in Hindi should be required to indicate his full name in block letters within brackets below his signature.
              </span>
            </div>

            <div className="note-rule">
              <span className="static-label">
                If the person paid cannot sign, the payment must be certified by the paying officer and atleast one witness.
              </span>
            </div>

            <div className="note-rule">
              <span className="static-label">
                If the amount be paid more than Rs. 5000/- a Receipt Stamp of 1/- must be affixed and this stamp must be paid for by the person to whom the amount of receipt is paid.
              </span>
            </div>

            <div className="acg17-cert1">
              <span className="static-label">
                1. Certified that the amount included in the voucher has been disbursed to the proper person.
              </span>
            </div>
          </div>
        </div>

        {/* LOWER SECTION: Officer Signatures, Certificate 2 & Bottom Date */}
        <div>
          {/* OFFICER SIGNATURES (Right-Aligned Column) */}
          <div className="acg17-officers">
            <div className="static-label">Paying Officer</div>
            <div className="static-label acg17-officer-gap1">Counter Signed</div>
            <div className="static-label acg17-officer-gap2">
              Disbursing Officer
            </div>
          </div>

          {/* CERTIFICATE 2 PARAGRAPH */}
          <div className="acg17-cert2">
            <span className="static-label">
              2. Received contents and certified that I have satisfied myself that all advances included in receipt form A.C.G. 17 drawn 1 month / 2 months / 3 months previous to this date with the exception of those detailed below (of which the total has been refunded from this receipt) has been disbursed to the proper persons and that their acceptances have been taken &amp; filed in my office with receipt stamps duly cancelled for every payment in excess of Rs. 5000/-
            </span>
          </div>

          {/* BOTTOM DATE & DISBURSING OFFICER */}
          <div className="acg17-bottom-row">
            <div>
              <span className="static-label acg17-label-bold">Date:</span>
              <span className="acg17-bottom-date-val">{dateFormatted}</span>
            </div>
            <div className="static-label acg17-bottom-officer">
              Disbursing Officer
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

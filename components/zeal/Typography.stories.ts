import '../assets/css/tailwind.css'
import '../assets/css/typography.css'
import '../assets/css/layout.css'

const text = `<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. <a href="http://loripsum.net/" target="_blank">Aufert enim sensus actionemque tollit omnem.</a> Sed quid sentiat, non videtis. Hic <code>ambiguo ludimur</code>. Duo Reges: constructio interrete. Si id dicis, vicimus. </p>

<ol>
	<li>Quam ob rem tandem, inquit, non satisfacit?</li>
	<li>Consequens enim est et post oritur, ut dixi.</li>
	<li>Idem iste, inquam, de voluptate quid sentit?</li>
  <li>Quam ob rem tandem, inquit, non satisfacit?</li>
	<li>Consequens enim est et post oritur, ut dixi.</li>
	<li>Idem iste, inquam, de voluptate quid sentit?</li>
  <li>Quam ob rem tandem, inquit, non satisfacit?</li>
	<li>Consequens enim est et post oritur, ut dixi.</li>
	<li>Idem iste, inquam, de voluptate quid sentit?</li>
  <li>Quam ob rem tandem, inquit, non satisfacit?</li>
	<li>Consequens enim est et post oritur, ut dixi.</li>
	<li>Idem iste, inquam, de voluptate quid sentit?</li>
</ol>

<pre>E quo efficitur, non ut nos non intellegamus quae vis sit
istius verbi, sed ut ille suo more loquatur, nostrum
neglegat.

Vives, inquit Aristo, magnifice atque praeclare, quod erit
cumque visum ages, numquam angere, numquam cupies, numquam
timebis.
</pre>

<h2>Heading 2</h2>

<p>Hoc non est positum in nostra actione. Mihi enim satis est, ipsis non satis. Quae diligentissime contra Aristonem dicuntur a Chryippo. Nos cum te, M. Illa videamus, quae a te de amicitia dicta sunt. </p>

<figure><img src="https://images.unsplash.com/photo-1556740758-90de374c12ad?ixlib=rb-1.2.1&amp;ixid=eyJhcHBfaWQiOjEyMDd9&amp;auto=format&amp;fit=crop&amp;w=1000&amp;q=80" alt=""><figcaption>Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old.</figcaption></figure>


<ul>
	<li>Nam illud vehementer repugnat, eundem beatum esse et multis malis oppressum.</li>
	<li>Sic enim maiores nostri labores non fugiendos tristissimo tamen verbo aerumnas etiam in deo nominaverunt.</li>
	<li>Nam Metrodorum non puto ipsum professum, sed, cum appellaretur ab Epicuro, repudiare tantum beneficium noluisse;</li>
	<li>Ab his oratores, ab his imperatores ac rerum publicarum principes extiterunt.</li>
  <li>Nam illud vehementer repugnat, eundem beatum esse et multis malis oppressum.</li>
  <li>Nam illud vehementer repugnat, eundem beatum esse et multis malis oppressum.</li>
	<li>Sic enim maiores nostri labores non fugiendos tristissimo tamen verbo aerumnas etiam in deo nominaverunt.</li>
	<li>Nam Metrodorum non puto ipsum professum, sed, cum appellaretur ab Epicuro, repudiare tantum beneficium noluisse;</li>
	<li>Ab his oratores, ab his imperatores ac rerum publicarum principes extiterunt.</li>
  <li>Nam illud vehementer repugnat, eundem beatum esse et multis malis oppressum.</li>
  <li>Nam illud vehementer repugnat, eundem beatum esse et multis malis oppressum.</li>
	<li>Sic enim maiores nostri labores non fugiendos tristissimo tamen verbo aerumnas etiam in deo nominaverunt.</li>
	<li>Nam Metrodorum non puto ipsum professum, sed, cum appellaretur ab Epicuro, repudiare tantum beneficium noluisse;</li>
	<li>Ab his oratores, ab his imperatores ac rerum publicarum principes extiterunt.</li>
  <li>Nam illud vehementer repugnat, eundem beatum esse et multis malis oppressum.</li>
</ul>


<h3>Heading 3</h3>
<h4>Heading 4</h4>
<h5>Heading 5</h5>
<h6>Heading 6</h6>

<p>Iam contemni non poteris. Quid enim est a Chrysippo praetermissum in Stoicis? Refert tamen, quo modo. Eadem fortitudinis ratio reperietur. Sint modo partes vitae beatae. Qua tu etiam inprudens utebare non numquam. Quid nunc honeste dicit? Beatus sibi videtur esse moriens. </p>`

export default {
  title: 'Typography'
}

export const DEFAULT = () => ({
  template: `<div class="grid grid-cols-3">
    <div class="p-5 prose">
      <h1>Default</h1>
      ${text}
    </div>
    <div class="p-5 prose prose-muted">
      <h1>Default Muted</h1>
      ${text}
    </div>
  </div>`
})

export const SM = () => ({
  template: `<div class="grid grid-cols-2">
    <div class="p-5 prose prose-sm">
      <h1>SM</h1>
      ${text}
    </div>
    <div class="p-5 prose prose-sm prose-muted">
      <h1>SM Muted</h1>
      ${text}
    </div>
  </div>`
})

export const LG = () => ({
  template: `<div class="grid grid-cols-2">
    <div class="p-5 prose prose-lg">
      <h1>LG</h1>
      ${text}
    </div>
    <div class="p-5 prose prose-lg prose-muted">
      <h1>LG Muted</h1>
      ${text}
    </div>
  </div>`
})

export const XL = () => ({
  template: `<div class="grid grid-cols-2">
    <div class="p-5 prose prose-xl">
      <h1>XL</h1>
      ${text}
    </div>
    <div class="p-5 prose prose-xl prose-muted">
      <h1>XL Muted</h1>
      ${text}
    </div>
  </div>`
})

export const TwoXL = () => ({
  template: `<div class="grid grid-cols-2">
    <div class="p-5 prose prose-2xl">
      <h1>2xl</h1>
      ${text}
    </div>
    <div class="p-5 prose prose-2xl prose-muted">
      <h1>2xl Muted</h1>
      ${text}
    </div>
  </div>`
})

export const IssueDescription = () => ({
  template: `<div class="grid grid-cols-2">
    <div class="p-5 prose-issue-description max-w-md">
      <h1>Issue description typography (heading 1)</h1>
      ${text}
    </div>
    <div class="p-5 prose max-w-md">
      <h1>Default</h1>
      ${text}
    </div>
  </div>`
})
